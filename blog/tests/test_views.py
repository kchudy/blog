from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from blog.models import Post, Tag

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

    def test_header_shows_total_published_post_count(self, client, published_post, draft_post):
        response = client.get(reverse("blog:post_list"))
        assert "01 posts" in response.content.decode()

    def test_filters_by_tag(self, client, author):
        wireguard = Tag.objects.create(name="WireGuard", slug="wireguard")
        matching = Post.objects.create(
            title="WireGuard Setup",
            slug="wireguard-setup",
            body="Body.",
            author=author,
            status=Post.Status.PUBLISHED,
            published_at=timezone.now() - timedelta(days=1),
        )
        matching.tags.add(wireguard)
        other = Post.objects.create(
            title="Unrelated Post",
            slug="unrelated-post",
            body="Body.",
            author=author,
            status=Post.Status.PUBLISHED,
            published_at=timezone.now() - timedelta(days=1),
        )

        response = client.get(reverse("blog:post_list"), {"tag": "wireguard"})
        content = response.content.decode()
        assert matching.title in content
        assert other.title not in content

    def test_unknown_tag_returns_no_posts(self, client, published_post):
        response = client.get(reverse("blog:post_list"), {"tag": "does-not-exist"})
        assert response.status_code == 200
        assert published_post.title not in response.content.decode()

    def test_sorts_by_title_ascending(self, client, author):
        for title in ["Zebra Post", "Alpha Post"]:
            Post.objects.create(
                title=title,
                slug=title.lower().replace(" ", "-"),
                body="Body.",
                author=author,
                status=Post.Status.PUBLISHED,
                published_at=timezone.now() - timedelta(days=1),
            )

        response = client.get(reverse("blog:post_list"), {"sort": "title", "dir": "asc"})
        content = response.content.decode()
        assert content.index("Alpha Post") < content.index("Zebra Post")

    def test_invalid_sort_param_falls_back_to_default(self, client, published_post):
        response = client.get(reverse("blog:post_list"), {"sort": "author__username"})
        assert response.status_code == 200
        assert published_post.title in response.content.decode()


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

    def test_result_tag_links_point_to_the_post_index(self, client, published_post):
        response = client.get(reverse("blog:search"), {"q": "published"})
        assert f'href="{reverse("blog:post_list")}?tag=django"' in response.content.decode()


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
