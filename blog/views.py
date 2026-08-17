from django.views.generic import DetailView, ListView

from blog.models import Post


class PostListView(ListView):
    """The public list of published posts, most recent first."""

    model = Post
    paginate_by = 10
    context_object_name = "posts"
    template_name = "blog/post_list.html"

    def get_queryset(self):
        return Post.objects.published().select_related("author").prefetch_related("tags")


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
