import { describe, expect, it } from "vitest";

import { filterByTag, findBySlug, paginate, search } from "./posts.js";

const posts = [
  {
    slug: "a",
    title: "Hello World",
    bodyText: "This is a greeting.",
    tags: ["django"],
  },
  {
    slug: "b",
    title: "Second Post",
    bodyText: "Nothing to see about hello here.",
    tags: ["svelte"],
  },
  {
    slug: "c",
    title: "Third",
    bodyText: "Unrelated content.",
    tags: ["django", "svelte"],
  },
];

describe("search", () => {
  it("matches the title case-insensitively", () => {
    expect(search(posts, "hello").map((p) => p.slug)).toContain("a");
    expect(search(posts, "HELLO").map((p) => p.slug)).toContain("a");
  });

  it("matches body text", () => {
    expect(search(posts, "greeting").map((p) => p.slug)).toEqual(["a"]);
  });

  it("matches across title and body independently per post", () => {
    // "hello" is in post a's title and post b's body text
    expect(
      search(posts, "hello")
        .map((p) => p.slug)
        .sort(),
    ).toEqual(["a", "b"]);
  });

  it("returns nothing for a blank or whitespace-only query", () => {
    expect(search(posts, "")).toEqual([]);
    expect(search(posts, "   ")).toEqual([]);
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

describe("paginate", () => {
  const many = Array.from({ length: 25 }, (_, i) => ({ slug: `p${i}` }));

  it("returns a full first page with a next page available", () => {
    const { items, hasPrevious, hasNext } = paginate(many, 1);
    expect(items).toHaveLength(10);
    expect(hasPrevious).toBe(false);
    expect(hasNext).toBe(true);
  });

  it("has a previous page but no next page on the last page", () => {
    const { items, hasPrevious, hasNext } = paginate(many, 3);
    expect(items).toHaveLength(5);
    expect(hasPrevious).toBe(true);
    expect(hasNext).toBe(false);
  });
});
