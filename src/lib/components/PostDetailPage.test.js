import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import PostDetailPage from "./PostDetailPage.svelte";

// vi.mock calls are hoisted above imports by Vitest, so these still apply to the imports above.
vi.mock("../posts.js", () => ({
  allPosts: [
    {
      slug: "published-post",
      title: "Published Post",
      author: "Ada",
      tags: [],
      publishedAt: "2024-01-01T00:00:00.000Z",
      bodyHtml: "<h1>Hello</h1>",
    },
  ],
  findBySlug: (posts, slug) => posts.find((p) => p.slug === slug) ?? null,
}));

vi.mock("../storage.svelte.js", () => ({
  readTracker: { isRead: () => false, markRead: () => {} },
}));

describe("PostDetailPage", () => {
  it("renders a published post's title and sanitized body", () => {
    render(PostDetailPage, { slug: "published-post" });
    expect(screen.getByText("Published Post")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Hello" }),
    ).toBeInTheDocument();
  });

  it("shows a not-found message for an unknown slug", () => {
    render(PostDetailPage, { slug: "does-not-exist" });
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });
});
