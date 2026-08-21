import { describe, expect, it } from "vitest";

import {
  archiveBuckets,
  filterByTag,
  findBySlug,
  search,
  sortByKey,
  tagCounts,
} from "./posts.js";

const posts = [
  {
    slug: "a",
    title: "Hello World",
    author: "Ada Lovelace",
    publishedAt: "2024-03-01T00:00:00.000Z",
    tags: ["django"],
  },
  {
    slug: "b",
    title: "Second Post",
    author: "Grace Hopper",
    publishedAt: "2024-02-01T00:00:00.000Z",
    tags: ["svelte"],
  },
  {
    slug: "c",
    title: "Third",
    author: "Ada Lovelace",
    publishedAt: "2024-01-01T00:00:00.000Z",
    tags: ["django", "svelte"],
  },
];

describe("search", () => {
  it("matches the title case-insensitively", () => {
    expect(search(posts, "hello").map((p) => p.slug)).toEqual(["a"]);
    expect(search(posts, "HELLO").map((p) => p.slug)).toEqual(["a"]);
  });

  it("matches the author", () => {
    expect(
      search(posts, "grace")
        .map((p) => p.slug)
        .sort(),
    ).toEqual(["b"]);
  });

  it("matches tags", () => {
    expect(
      search(posts, "svelte")
        .map((p) => p.slug)
        .sort(),
    ).toEqual(["b", "c"]);
  });

  it("returns every post unchanged for a blank or whitespace-only query", () => {
    expect(search(posts, "")).toEqual(posts);
    expect(search(posts, "   ")).toEqual(posts);
  });

  it("returns nothing when there's no match", () => {
    expect(search(posts, "nonexistent-term")).toEqual([]);
  });
});

describe("filterByTag", () => {
  it("returns only posts carrying the given tag", () => {
    expect(
      filterByTag(posts, "svelte")
        .map((p) => p.slug)
        .sort(),
    ).toEqual(["b", "c"]);
  });

  it("returns nothing for an unused tag", () => {
    expect(filterByTag(posts, "rust")).toEqual([]);
  });
});

describe("findBySlug", () => {
  it("finds a post by its slug", () => {
    expect(findBySlug(posts, "b").title).toBe("Second Post");
  });

  it("returns null for an unknown slug", () => {
    expect(findBySlug(posts, "does-not-exist")).toBeNull();
  });
});

describe("sortByKey", () => {
  it("sorts by date, newest first by default direction (desc)", () => {
    expect(sortByKey(posts, "date", "desc").map((p) => p.slug)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("sorts by date ascending", () => {
    expect(sortByKey(posts, "date", "asc").map((p) => p.slug)).toEqual([
      "c",
      "b",
      "a",
    ]);
  });

  it("sorts by title case-insensitively", () => {
    expect(sortByKey(posts, "title", "asc").map((p) => p.slug)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("does not mutate the input array", () => {
    const copy = [...posts];
    sortByKey(posts, "title", "asc");
    expect(posts).toEqual(copy);
  });
});

describe("tagCounts", () => {
  it("counts tags in first-seen order across posts", () => {
    expect(tagCounts(posts)).toEqual([
      { tag: "django", count: 2 },
      { tag: "svelte", count: 2 },
    ]);
  });
});

describe("archiveBuckets", () => {
  it("buckets posts by YYYY-MM, newest first", () => {
    expect(archiveBuckets(posts)).toEqual([
      { month: "2024-03", count: 1 },
      { month: "2024-02", count: 1 },
      { month: "2024-01", count: 1 },
    ]);
  });
});
