from datetime import timedelta

import pytest
from django.utils import timezone

from blog.models import Post, Tag

pytestmark = pytest.mark.django_db


class TestPostQuerySetPublished:
    def test_includes_published_posts_in_the_past(self, published_post):
        assert list(Post.objects.published()) == [published_post]

    def test_excludes_draft_posts(self, draft_post):
        assert draft_post not in Post.objects.published()

    def test_excludes_posts_published_in_the_future(self, future_post):
        assert future_post not in Post.objects.published()


class TestPostQuerySetSearch:
    def test_matches_title_case_insensitively(self, published_post):
        assert list(Post.objects.search("published")) == [published_post]
        assert list(Post.objects.search("PUBLISHED")) == [published_post]

    def test_matches_body_text(self, published_post):
        assert list(Post.objects.search("Hello")) == [published_post]

    def test_no_match_returns_empty(self, published_post):
        assert list(Post.objects.search("nonexistent-term")) == []

    def test_can_be_combined_with_published(self, published_post, draft_post):
        draft_post.title = "Draft Post about Django"
        draft_post.save()
        results = Post.objects.published().search("Django")
        assert draft_post not in results


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


class TestTagWithPostCounts:
    def test_counts_only_posts_in_the_given_queryset(self, published_post, draft_post, tag):
        draft_post.tags.add(tag)
        result = Tag.objects.with_post_counts(Post.objects.published())
        assert [t.post_count for t in result if t.slug == tag.slug] == [1]

    def test_excludes_tags_with_no_matching_posts(self, published_post):
        unused = Tag.objects.create(name="Unused", slug="unused")
        result = Tag.objects.with_post_counts(Post.objects.published())
        assert unused not in result

    def test_orders_by_first_use(self, author):
        early_tag = Tag.objects.create(name="Early", slug="early")
        late_tag = Tag.objects.create(name="Late", slug="late")
        early_post = Post.objects.create(
            title="Early Post",
            slug="early-post",
            body="Early.",
            author=author,
            status=Post.Status.PUBLISHED,
            published_at=timezone.now() - timedelta(days=10),
        )
        early_post.tags.add(late_tag)
        late_post = Post.objects.create(
            title="Late Post",
            slug="late-post",
            body="Late.",
            author=author,
            status=Post.Status.PUBLISHED,
            published_at=timezone.now() - timedelta(days=1),
        )
        late_post.tags.add(early_tag)

        result = list(Tag.objects.with_post_counts(Post.objects.published()))
        assert [t.slug for t in result] == ["late", "early"]
