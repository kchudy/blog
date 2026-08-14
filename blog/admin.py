from django.contrib import admin

from blog.models import Post, Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ["name"]}
    search_fields = ["name"]


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "status", "published_at", "updated_at"]
    list_filter = ["status", "tags"]
    search_fields = ["title", "body"]
    prepopulated_fields = {"slug": ["title"]}
    autocomplete_fields = ["author"]
    filter_horizontal = ["tags"]
    date_hierarchy = "published_at"

    def save_model(self, request, obj, form, change):
        if not obj.pk and not obj.author_id:
            obj.author = request.user
        super().save_model(request, obj, form, change)
