from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.views.generic import DetailView, ListView

from blog.forms import SearchForm
from blog.models import Post, Tag

# Whitelisted so `?sort=`/`?dir=` can't be used to order by an arbitrary model field.
SORT_FIELDS = {"date": "published_at", "title": "title"}
DEFAULT_SORT_DIR = {"date": "desc", "title": "asc"}


class PostListView(ListView):
    """The public list of published posts.

    Supports the post index's tag rail (`?tag=<slug>`) and sort control (`?sort=date|title` +
    `?dir=asc|desc`) as plain query-string params, so filtering/sorting works with JS disabled;
    see `static/js/post-index.js` for the progressive-enhancement live text filter layered on
    top.
    """

    model = Post
    paginate_by = 10
    context_object_name = "posts"
    template_name = "blog/post_list.html"

    def get_queryset(self):
        self.active_tag = self.request.GET.get("tag", "")
        self.sort_key = (
            self.request.GET.get("sort") if self.request.GET.get("sort") in SORT_FIELDS else "date"
        )
        self.sort_dir = (
            self.request.GET.get("dir")
            if self.request.GET.get("dir") in ("asc", "desc")
            else DEFAULT_SORT_DIR[self.sort_key]
        )

        queryset = Post.objects.published().select_related("author").prefetch_related("tags")
        if self.active_tag:
            queryset = queryset.filter(tags__slug=self.active_tag)

        order_field = SORT_FIELDS[self.sort_key]
        prefix = "" if self.sort_dir == "asc" else "-"
        return queryset.order_by(f"{prefix}{order_field}")

    def _url(self, **overrides):
        """Build `?...` for this page, keeping the current `sort`/`dir` unless overridden.

        `tag` is dropped by default (most links either set it explicitly or want it cleared,
        e.g. switching sort keeps the tag filter, clearing/"All posts" drops it) and `page`
        always resets since any of these changes invalidates the current page number.
        """
        params = self.request.GET.copy()
        params.pop("page", None)
        params.pop("tag", None)
        params["sort"] = self.sort_key
        params["dir"] = self.sort_dir
        for key, value in overrides.items():
            if value:
                params[key] = value
            else:
                params.pop(key, None)
        query = params.urlencode()
        return f"?{query}" if query else "?"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        published = Post.objects.published()

        context["search_form"] = SearchForm()
        context["active_tag"] = self.active_tag
        context["has_filter"] = bool(self.active_tag)
        context["clear_url"] = self._url()
        context["total_published_posts"] = published.count()

        context["tag_nav"] = [
            {
                "label": "All posts",
                "count": context["total_published_posts"],
                "active": not self.active_tag,
                "url": self._url(),
            }
        ] + [
            {
                "label": tag.name,
                "count": tag.post_count,
                "active": tag.slug == self.active_tag,
                "url": self._url(tag=tag.slug),
            }
            for tag in Tag.objects.with_post_counts(published)
        ]
        context["distinct_tag_count"] = len(context["tag_nav"]) - 1
        context["distinct_author_count"] = published.values("author").distinct().count()
        context["archive"] = (
            published.annotate(month=TruncMonth("published_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("-month")
        )
        context["sort_options"] = [
            {
                "key": key,
                "label": label,
                "active": key == self.sort_key,
                "arrow": "↓" if self.sort_dir == "desc" else "↑",
                "url": self._url(
                    tag=self.active_tag,
                    sort=key,
                    dir=self._flip(self.sort_dir)
                    if key == self.sort_key
                    else DEFAULT_SORT_DIR[key],
                ),
            }
            for key, label in [("date", "Date"), ("title", "Title")]
        ]

        page_obj = context["page_obj"]
        if page_obj.has_previous():
            context["previous_page_url"] = self._url(
                tag=self.active_tag, page=page_obj.previous_page_number()
            )
        if page_obj.has_next():
            context["next_page_url"] = self._url(
                tag=self.active_tag, page=page_obj.next_page_number()
            )
        return context

    @staticmethod
    def _flip(direction):
        return "asc" if direction == "desc" else "desc"


class SearchView(ListView):
    """Published posts matching a `?q=` query, searched by title and body text.

    A blank or missing query renders the search page with no results rather than the full
    post list — see `SearchForm`, which treats `q` as optional so the page doesn't 404/error
    when visited without a query string.
    """

    model = Post
    paginate_by = 10
    context_object_name = "posts"
    template_name = "blog/search_results.html"

    def get_queryset(self):
        self.form = SearchForm(self.request.GET)
        self.query = self.form.cleaned_data["q"].strip() if self.form.is_valid() else ""
        if not self.query:
            return Post.objects.none()
        return (
            Post.objects.published()
            .search(self.query)
            .select_related("author")
            .prefetch_related("tags")
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["search_form"] = self.form
        context["query"] = self.query
        return context


class PostDetailView(DetailView):
    """A single published post's detail page.

    404s if no post with the given slug exists or if it isn't currently published — draft
    posts and posts scheduled for the future are not reachable by URL for a reader.
    """

    model = Post
    context_object_name = "post"
    template_name = "blog/post_detail.html"

    def get_queryset(self):
        return Post.objects.published().select_related("author").prefetch_related("tags")
