// Reads from the build-time-generated src/generated/posts.json (see scripts/build-content.js) —
// there is no runtime datastore. "Published" filtering already happened at build time, so
// everything in here is just querying/filtering an already-public, already-static list.
//
// The filter/search/paginate helpers below take `posts` as a plain argument rather than reading
// `allPosts` themselves, purely so tests can exercise them against fixture arrays without
// depending on src/generated/posts.json existing on disk.
import generated from "../generated/posts.json";

export const PAGE_SIZE = 10;
export const allPosts = generated.posts;
export const allTags = generated.tags;

export function findBySlug(posts, slug) {
  return posts.find((post) => post.slug === slug) ?? null;
}

export function filterByTag(posts, tag) {
  return posts.filter((post) => post.tags.includes(tag));
}

/**
 * Case-insensitive substring match against title or body text — mirrors the Django version's
 * `PostQuerySet.search()` (`title__icontains` / `body__icontains`), just against pre-rendered
 * plain text instead of raw Markdown source. A blank query matches nothing (same as the old
 * `SearchView`: no query string means "no results", not "show everything").
 */
export function search(posts, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(q) ||
      post.bodyText.toLowerCase().includes(q),
  );
}

/** Slices `posts` into `page` (1-indexed) of PAGE_SIZE, plus whether there's a next/previous page. */
export function paginate(posts, page) {
  const start = (page - 1) * PAGE_SIZE;
  return {
    items: posts.slice(start, start + PAGE_SIZE),
    hasPrevious: page > 1,
    hasNext: start + PAGE_SIZE < posts.length,
  };
}
