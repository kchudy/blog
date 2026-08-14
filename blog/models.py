from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone

from blog.markdown import render_markdown


class Tag(models.Model):
    """A short label used to group related posts."""

    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class PostQuerySet(models.QuerySet):
    def published(self):
        """Posts visible to the public: `status=published` and `published_at` in the past."""
        return self.filter(status=Post.Status.PUBLISHED, published_at__lte=timezone.now())


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
