import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db


class TestPostListView:
    def test_lists_published_posts(self, client, published_post):
        response = client.get(reverse("blog:post_list"))
        assert response.status_code == 200
        assert published_post.title in response.content.decode()

    def test_excludes_draft_posts(self, client, draft_post):
        response = client.get(reverse("blog:post_list"))
        assert response.status_code == 200
        assert draft_post.title not in response.content.decode()

    def test_excludes_posts_published_in_the_future(self, client, future_post):
        response = client.get(reverse("blog:post_list"))
        assert response.status_code == 200
        assert future_post.title not in response.content.decode()


class TestPostDetailView:
    def test_renders_published_post_with_sanitized_html_body(self, client, published_post):
        response = client.get(reverse("blog:post_detail", args=[published_post.slug]))
        assert response.status_code == 200
        content = response.content.decode()
        assert published_post.title in content
        assert "<h1>Hello</h1>" in content

    def test_404s_for_draft_post(self, client, draft_post):
        response = client.get(reverse("blog:post_detail", args=[draft_post.slug]))
        assert response.status_code == 404

    def test_404s_for_post_published_in_the_future(self, client, future_post):
        response = client.get(reverse("blog:post_detail", args=[future_post.slug]))
        assert response.status_code == 404

    def test_404s_for_unknown_slug(self, client):
        response = client.get(reverse("blog:post_detail", args=["does-not-exist"]))
        assert response.status_code == 404
