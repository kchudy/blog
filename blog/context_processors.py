from blog.models import Post


def site_stats(request):
    """Site-wide counts the header shows on every page (e.g. the total published post count)."""
    return {"total_published_posts": Post.objects.published().count()}
