from django.contrib.syndication.views import Feed
from django.urls import reverse_lazy

from blog.models import Post

LATEST_POSTS_LIMIT = 20


class LatestPostsFeed(Feed):
    """RSS feed of the most recently published posts, served at `/feed/`."""

    title = "Blog"
    link = reverse_lazy("blog:post_list")
    description = "Latest published posts."

    def items(self):
        return Post.objects.published().order_by("-published_at")[:LATEST_POSTS_LIMIT]

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        return item.body_html

    def item_link(self, item):
        return item.get_absolute_url()

    def item_pubdate(self, item):
        return item.published_at
