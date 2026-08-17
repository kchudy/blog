from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone

from blog.models import Post, Tag


@pytest.fixture
def author(db):
    return get_user_model().objects.create_user(username="author", password="password")


@pytest.fixture
def tag(db):
    return Tag.objects.create(name="Django", slug="django")


@pytest.fixture
def published_post(db, author, tag):
    post = Post.objects.create(
        title="Published Post",
        slug="published-post",
        body="# Hello\n\nThis is **published**.",
        author=author,
        status=Post.Status.PUBLISHED,
        published_at=timezone.now() - timedelta(days=1),
    )
    post.tags.add(tag)
    return post


@pytest.fixture
def draft_post(db, author):
    return Post.objects.create(
        title="Draft Post",
        slug="draft-post",
        body="Not ready yet.",
        author=author,
        status=Post.Status.DRAFT,
        published_at=timezone.now() - timedelta(days=1),
    )


@pytest.fixture
def future_post(db, author):
    return Post.objects.create(
        title="Future Post",
        slug="future-post",
        body="Coming soon.",
        author=author,
        status=Post.Status.PUBLISHED,
        published_at=timezone.now() + timedelta(days=1),
    )
