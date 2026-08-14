import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from blog.models import Post

pytestmark = pytest.mark.django_db


@pytest.fixture
def admin_client_logged_in(admin_client):
    return admin_client


class TestPostAdmin:
    def test_admin_can_create_a_post(self, admin_client_logged_in, tag):
        author = get_user_model().objects.get(username="admin")
        response = admin_client_logged_in.post(
            reverse("admin:blog_post_add"),
            {
                "title": "My New Post",
                "slug": "my-new-post",
                "body": "Some **Markdown** body.",
                "author": author.pk,
                "tags": [tag.pk],
                "status": Post.Status.DRAFT,
                "published_at_0": "",
                "published_at_1": "",
            },
        )
        assert response.status_code == 302
        assert Post.objects.filter(slug="my-new-post", author=author).exists()

    def test_post_list_is_reachable(self, admin_client_logged_in, published_post):
        response = admin_client_logged_in.get(reverse("admin:blog_post_changelist"))
        assert response.status_code == 200
        assert published_post.title in response.content.decode()
