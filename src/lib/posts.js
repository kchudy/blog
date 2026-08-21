// Reads from the build-time-generated src/generated/posts.json (see scripts/build-content.js) —
// there is no runtime datastore. "Published" filtering already happened at build time, so
// everything in here is just querying/filtering/sorting an already-public, already-static list.
//
// The filter/search/sort helpers below take `posts` as a plain argument rather than reading
// `allPosts` themselves, purely so tests can exercise them against fixture arrays without
// depending on src/generated/posts.json existing on disk.
import generated from "../generated/posts.json";

export const allPosts = generated.posts;
export const allTags = generated.tags;
export const siteMeta = generated.meta;

export function findBySlug(posts, slug) {
  return posts.find((post) => post.slug === slug) ?? null;
}

export function filterByTag(posts, tag) {
  return posts.filter((post) => post.tags.includes(tag));
}

/**
 * Case-insensitive substring match against title, author or tags — the post index's live filter
 * (search box + tag rail compose as AND, see PostListPage). A blank/whitespace query is "no
 * filter", so it returns `posts` unchanged rather than an empty list.
 */
export function search(posts, query) {
  const q = query.trim().toLowerCase();
  if (!q) return posts;
  return posts.filter((post) =>
    `${post.title} ${post.author} ${post.tags.join(" ")}`
      .toLowerCase()
      .includes(q),
  );
}

/** Sorts `posts` by `sortKey` ("date" | "title") in `sortDir` ("asc" | "desc"). */
export function sortByKey(posts, sortKey, sortDir) {
  const value = (post) =>
    sortKey === "title" ? post.title.toLowerCase() : post.publishedAt;
  const sorted = [...posts].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });
  return sorted;
}

/** Tag → post count, in first-seen order across `posts` (used by the post index's tag rail). */
export function tagCounts(posts) {
  const counts = new Map();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([tag, count]) => ({ tag, count }));
}

/** Post counts bucketed by "YYYY-MM", newest bucket first (used by the post index's archive). */
export function archiveBuckets(posts) {
  const counts = new Map();
  for (const post of posts) {
    const month = post.publishedAt.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([month, count]) => ({ month, count }));
}
