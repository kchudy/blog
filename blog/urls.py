from django.urls import path

from blog.feeds import LatestPostsFeed
from blog.views import PostDetailView, PostListView, SearchView

app_name = "blog"

urlpatterns = [
    path("posts/", PostListView.as_view(), name="post_list"),
    path("posts/<slug:slug>/", PostDetailView.as_view(), name="post_detail"),
    path("search/", SearchView.as_view(), name="search"),
    path("feed/", LatestPostsFeed(), name="feed"),
]
