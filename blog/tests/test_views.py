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


class TestSearchView:
    def test_matches_title(self, client, published_post):
        response = client.get(reverse("blog:search"), {"q": "Published"})
        assert response.status_code == 200
        assert published_post.title in response.content.decode()

    def test_matches_body(self, client, published_post):
        response = client.get(reverse("blog:search"), {"q": "Hello"})
        assert response.status_code == 200
        assert published_post.title in response.content.decode()

    def test_is_case_insensitive(self, client, published_post):
        response = client.get(reverse("blog:search"), {"q": "published"})
        assert published_post.title in response.content.decode()

    def test_excludes_draft_posts_even_on_exact_match(self, client, draft_post):
        response = client.get(reverse("blog:search"), {"q": "Draft Post"})
        assert response.status_code == 200
        assert response.context["posts"].count() == 0
        assert "No articles found" in response.content.decode()

    def test_excludes_posts_published_in_the_future(self, client, future_post):
        response = client.get(reverse("blog:search"), {"q": "Future"})
        assert response.status_code == 200
        assert future_post.title not in response.content.decode()

    def test_no_results_message_for_unmatched_query(self, client, published_post):
        response = client.get(reverse("blog:search"), {"q": "nonexistent-term"})
        assert response.status_code == 200
        content = response.content.decode()
        assert "No articles found" in content
        assert published_post.title not in content

    def test_blank_query_shows_no_results_and_no_error(self, client, published_post):
        response = client.get(reverse("blog:search"), {"q": ""})
        assert response.status_code == 200
        assert published_post.title not in response.content.decode()

    def test_missing_query_param_shows_no_error(self, client, published_post):
        response = client.get(reverse("blog:search"))
        assert response.status_code == 200

    def test_special_characters_are_handled_safely(self, client, published_post):
        response = client.get(reverse("blog:search"), {"q": "'; DROP TABLE posts; --"})
        assert response.status_code == 200


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
