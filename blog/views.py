from django.views.generic import DetailView, ListView

from blog.forms import SearchForm
from blog.models import Post


class PostListView(ListView):
    """The public list of published posts, most recent first."""

    model = Post
    paginate_by = 10
    context_object_name = "posts"
    template_name = "blog/post_list.html"

    def get_queryset(self):
        return Post.objects.published().select_related("author").prefetch_related("tags")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["search_form"] = SearchForm()
        return context


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
