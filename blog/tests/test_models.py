import pytest

from blog.models import Post

pytestmark = pytest.mark.django_db


class TestPostQuerySetPublished:
    def test_includes_published_posts_in_the_past(self, published_post):
        assert list(Post.objects.published()) == [published_post]

    def test_excludes_draft_posts(self, draft_post):
        assert draft_post not in Post.objects.published()

    def test_excludes_posts_published_in_the_future(self, future_post):
        assert future_post not in Post.objects.published()


class TestPostIsPublished:
    def test_true_for_published_post_in_the_past(self, published_post):
        assert published_post.is_published() is True

    def test_false_for_draft(self, draft_post):
        assert draft_post.is_published() is False

    def test_false_for_future_published_at(self, future_post):
        assert future_post.is_published() is False


class TestPostBodyHtml:
    def test_renders_markdown_to_html(self, published_post):
        assert "<h1>Hello</h1>" in published_post.body_html
        assert "<strong>published</strong>" in published_post.body_html

    def test_sanitizes_disallowed_tags(self, published_post):
        published_post.body = "Hello <script>alert('xss')</script>"
        assert "<script>" not in published_post.body_html
        assert "</script>" not in published_post.body_html


class TestTag:
    def test_str_returns_name(self, tag):
        assert str(tag) == "Django"
