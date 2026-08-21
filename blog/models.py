from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone

from blog.markdown import render_markdown


class TagQuerySet(models.QuerySet):
    def with_post_counts(self, posts):
        """Tags actually used by `posts`, annotated with `post_count` and ordered by first use.

        Used by the post index's tag rail, which needs a per-tag count and a stable "first-seen"
        order rather than alphabetical — both computed relative to whatever queryset (e.g.
        published posts) the caller passes in, not all posts ever tagged.
        """
        in_posts = models.Q(posts__in=posts)
        return (
            self.annotate(
                post_count=models.Count("posts", filter=in_posts, distinct=True),
                first_seen=models.Min("posts__published_at", filter=in_posts),
            )
            .filter(post_count__gt=0)
            .order_by("first_seen", "name")
        )


class Tag(models.Model):
    """A short label used to group related posts."""

    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True)

    objects = TagQuerySet.as_manager()

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class PostQuerySet(models.QuerySet):
    def published(self):
        """Posts visible to the public: `status=published` and `published_at` in the past."""
        return self.filter(status=Post.Status.PUBLISHED, published_at__lte=timezone.now())

    def search(self, query):
        """Case-insensitive match of `query` against title or body.

        Uses `icontains` rather than Postgres full-text search (`SearchVector`/`SearchQuery`) —
        at this project's scale a substring match is enough, and it works identically on the
        sqlite backend the test suite/CI run against (see `.ai/knowledge/conventions.md`'s note
        on the sqlite/Postgres split) without needing a Postgres-backed test setup.
        """
        return self.filter(models.Q(title__icontains=query) | models.Q(body__icontains=query))


class Post(models.Model):
    """A single article — see `.ai/project.md`'s glossary for the full definition."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    body = models.TextField(help_text="Article body in Markdown format.")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="posts",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="posts")
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    published_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this post went (or will go) public.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = PostQuerySet.as_manager()

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self) -> str:
        return self.title

    def get_absolute_url(self) -> str:
        return reverse("blog:post_detail", args=[self.slug])

    def is_published(self) -> bool:
        """Whether this post is currently visible to the public."""
        return (
            self.status == self.Status.PUBLISHED
            and self.published_at is not None
            and self.published_at <= timezone.now()
        )

    @property
    def body_html(self) -> str:
        """The post body rendered from Markdown to sanitized HTML."""
        return render_markdown(self.body)
