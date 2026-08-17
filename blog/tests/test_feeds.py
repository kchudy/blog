import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db


class TestLatestPostsFeed:
    def test_includes_published_post(self, client, published_post):
        response = client.get(reverse("blog:feed"))
        assert response.status_code == 200
        assert response["Content-Type"].startswith("application/rss+xml")
        content = response.content.decode()
        assert published_post.title in content
        assert published_post.get_absolute_url() in content

    def test_excludes_draft_post(self, client, draft_post):
        response = client.get(reverse("blog:feed"))
        assert draft_post.title not in response.content.decode()

    def test_excludes_post_published_in_the_future(self, client, future_post):
        response = client.get(reverse("blog:feed"))
        assert future_post.title not in response.content.decode()
