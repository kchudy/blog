import { render, screen } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PostListPage from "./PostListPage.svelte";

// vi.mock calls are hoisted above imports by Vitest, so this still applies to the import above.
vi.mock("../posts.js", () => ({
  allPosts: [
    {
      slug: "published-post",
      title: "Published Post",
      author: "Ada",
      tags: ["django"],
      publishedAt: "2024-01-01T00:00:00.000Z",
      bodyHtml: "<p>Hello</p>",
      bodyText: "Hello",
      excerpt: "Hello",
    },
  ],
  search: (posts, q) =>
    posts.filter((p) => p.title.toLowerCase().includes(q.trim().toLowerCase())),
  filterByTag: (posts, tag) => posts.filter((p) => p.tags.includes(tag)),
  paginate: (posts) => ({ items: posts, hasPrevious: false, hasNext: false }),
}));

describe("PostListPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lists published posts", () => {
    render(PostListPage, { params: new URLSearchParams() });
    expect(screen.getByText("Published Post")).toBeInTheDocument();
  });

  it("prompts for a query when searching with a blank q", () => {
    render(PostListPage, { params: new URLSearchParams("q=") });
    expect(screen.getByText(/enter a search term/i)).toBeInTheDocument();
    expect(screen.queryByText("Published Post")).not.toBeInTheDocument();
  });

  it("shows matches for a search that hits", () => {
    render(PostListPage, { params: new URLSearchParams("q=Published") });
    expect(screen.getByText("Published Post")).toBeInTheDocument();
  });

  it("shows a no-results message for an unmatched search", () => {
    render(PostListPage, { params: new URLSearchParams("q=nonexistent") });
    expect(screen.getByText(/no articles found/i)).toBeInTheDocument();
    expect(screen.queryByText("Published Post")).not.toBeInTheDocument();
  });
});
