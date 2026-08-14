"""Root URLconf: the Django admin (post authoring) plus the public blog app."""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("blog.urls")),
]
