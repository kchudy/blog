import { fireEvent, render, screen } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PostListPage from "./PostListPage.svelte";

// vi.mock calls are hoisted above imports by Vitest, so this still applies to the import above.
vi.mock("../posts.js", () => {
  const allPosts = [
    {
      slug: "published-post",
      title: "Published Post",
      author: "Ada",
      tags: ["django"],
      publishedAt: "2024-01-02T00:00:00.000Z",
    },
    {
      slug: "second-post",
      title: "Second Post",
      author: "Grace",
      tags: ["svelte"],
      publishedAt: "2024-01-01T00:00:00.000Z",
    },
  ];

  return {
    allPosts,
    siteMeta: { builtAt: "2024-01-01", version: "1.0.0" },
    search: (posts, q) => {
      const query = q.trim().toLowerCase();
      if (!query) return posts;
      return posts.filter((p) =>
        `${p.title} ${p.author} ${p.tags.join(" ")}`
          .toLowerCase()
          .includes(query),
      );
    },
    filterByTag: (posts, tag) => posts.filter((p) => p.tags.includes(tag)),
    sortByKey: (posts) => posts,
    tagCounts: (posts) => {
      const counts = new Map();
      posts.forEach((p) =>
        p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)),
      );
      return [...counts.entries()].map(([tag, count]) => ({ tag, count }));
    },
    archiveBuckets: () => [],
  };
});

describe("PostListPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lists every post by default", () => {
    render(PostListPage, { params: new URLSearchParams() });
    expect(screen.getByText("Published Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
  });

  it("filters live as the search box is typed into", async () => {
    render(PostListPage, { params: new URLSearchParams() });
    const input = screen.getByPlaceholderText(/filter posts/i);

    await fireEvent.input(input, { target: { value: "grace" } });

    expect(screen.getByText("Second Post")).toBeInTheDocument();
    expect(screen.queryByText("Published Post")).not.toBeInTheDocument();
  });

  it("shows only posts matching the tag given in the URL", () => {
    render(PostListPage, { params: new URLSearchParams("tag=svelte") });
    expect(screen.getByText("Second Post")).toBeInTheDocument();
    expect(screen.queryByText("Published Post")).not.toBeInTheDocument();
  });

  it("shows the empty state when no post matches the filter", async () => {
    render(PostListPage, { params: new URLSearchParams() });
    const input = screen.getByPlaceholderText(/filter posts/i);

    await fireEvent.input(input, { target: { value: "nonexistent" } });

    expect(screen.getByText("No matches")).toBeInTheDocument();
    expect(screen.queryByText("Published Post")).not.toBeInTheDocument();
  });
});
