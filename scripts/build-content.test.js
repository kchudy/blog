import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { buildContent } from "./build-content.js";

function makeDirs() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-content-test-"));
  const contentDir = path.join(root, "posts");
  fs.mkdirSync(contentDir, { recursive: true });
  return {
    root,
    contentDir,
    outDir: path.join(root, "out"),
    publicDir: path.join(root, "public"),
  };
}

function writePost(contentDir, filename, frontmatter, body) {
  const fm = Object.entries(frontmatter)
    .map(
      ([key, value]) =>
        `${key}: ${Array.isArray(value) ? `[${value.join(", ")}]` : value}`,
    )
    .join("\n");
  fs.writeFileSync(
    path.join(contentDir, filename),
    `---\n${fm}\n---\n${body}\n`,
  );
}

describe("buildContent", () => {
  let dirs;

  afterEach(() => {
    fs.rmSync(dirs.root, { recursive: true, force: true });
  });

  it("includes a published post in the past and renders its Markdown", () => {
    dirs = makeDirs();
    writePost(
      dirs.contentDir,
      "hello.md",
      {
        title: "Hello",
        slug: "hello",
        author: "Ada",
        status: "published",
        published_at: "2020-01-01",
      },
      "# Heading\n\nSome **bold** text.",
    );

    const { posts } = buildContent({ ...dirs, now: new Date("2024-01-01") });

    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe("Hello");
    expect(posts[0].bodyHtml).toContain("<h1>Heading</h1>");
    expect(posts[0].bodyHtml).toContain("<strong>bold</strong>");
  });

  it("excludes draft posts", () => {
    dirs = makeDirs();
    writePost(
      dirs.contentDir,
      "draft.md",
      {
        title: "Draft",
        slug: "draft",
        author: "Ada",
        status: "draft",
        published_at: "2020-01-01",
      },
      "Not ready.",
    );

    expect(
      buildContent({ ...dirs, now: new Date("2024-01-01") }).posts,
    ).toHaveLength(0);
  });

  it("excludes posts published in the future", () => {
    dirs = makeDirs();
    writePost(
      dirs.contentDir,
      "future.md",
      {
        title: "Future",
        slug: "future",
        author: "Ada",
        status: "published",
        published_at: "2099-01-01",
      },
      "Coming soon.",
    );

    expect(
      buildContent({ ...dirs, now: new Date("2024-01-01") }).posts,
    ).toHaveLength(0);
  });

  it("sanitizes disallowed tags out of rendered HTML", () => {
    dirs = makeDirs();
    writePost(
      dirs.contentDir,
      "xss.md",
      {
        title: "XSS",
        slug: "xss",
        author: "Ada",
        status: "published",
        published_at: "2020-01-01",
      },
      "Hello <script>alert('xss')</script>",
    );

    const { posts } = buildContent({ ...dirs, now: new Date("2024-01-01") });
    expect(posts[0].bodyHtml).not.toContain("<script>");
    expect(posts[0].bodyHtml).not.toContain("</script>");
  });

  it("throws a clear error for a missing required frontmatter field", () => {
    dirs = makeDirs();
    writePost(
      dirs.contentDir,
      "bad.md",
      { title: "Bad", author: "Ada", published_at: "2020-01-01" },
      "Body",
    );

    expect(() =>
      buildContent({ ...dirs, now: new Date("2024-01-01") }),
    ).toThrow(/missing required frontmatter/);
  });

  it("throws on duplicate slugs across files", () => {
    dirs = makeDirs();
    writePost(
      dirs.contentDir,
      "a.md",
      {
        title: "A",
        slug: "same",
        author: "Ada",
        status: "published",
        published_at: "2020-01-01",
      },
      "A",
    );
    writePost(
      dirs.contentDir,
      "b.md",
      {
        title: "B",
        slug: "same",
        author: "Ada",
        status: "published",
        published_at: "2020-01-02",
      },
      "B",
    );

    expect(() =>
      buildContent({ ...dirs, now: new Date("2024-01-01") }),
    ).toThrow(/Duplicate slug/);
  });

  it("sorts published posts most-recent-first", () => {
    dirs = makeDirs();
    writePost(
      dirs.contentDir,
      "old.md",
      {
        title: "Old",
        slug: "old",
        author: "Ada",
        status: "published",
        published_at: "2020-01-01",
      },
      "Old",
    );
    writePost(
      dirs.contentDir,
      "new.md",
      {
        title: "New",
        slug: "new",
        author: "Ada",
        status: "published",
        published_at: "2023-01-01",
      },
      "New",
    );

    const { posts } = buildContent({ ...dirs, now: new Date("2024-01-01") });
    expect(posts.map((p) => p.slug)).toEqual(["new", "old"]);
  });

  it("writes an RSS feed containing only published posts", () => {
    dirs = makeDirs();
    writePost(
      dirs.contentDir,
      "hello.md",
      {
        title: "Hello",
        slug: "hello",
        author: "Ada",
        status: "published",
        published_at: "2020-01-01",
      },
      "Body text.",
    );
    writePost(
      dirs.contentDir,
      "draft.md",
      {
        title: "Draft",
        slug: "draft",
        author: "Ada",
        status: "draft",
        published_at: "2020-01-01",
      },
      "Not ready.",
    );

    buildContent({ ...dirs, now: new Date("2024-01-01") });

    const feed = fs.readFileSync(
      path.join(dirs.publicDir, "feed.xml"),
      "utf-8",
    );
    expect(feed).toContain("<title>Hello</title>");
    expect(feed).not.toContain("Draft");
  });

  it("collects the union of tags across published posts", () => {
    dirs = makeDirs();
    writePost(
      dirs.contentDir,
      "a.md",
      {
        title: "A",
        slug: "a",
        author: "Ada",
        status: "published",
        published_at: "2020-01-01",
        tags: ["django", "svelte"],
      },
      "A",
    );
    writePost(
      dirs.contentDir,
      "b.md",
      {
        title: "B",
        slug: "b",
        author: "Ada",
        status: "published",
        published_at: "2020-01-02",
        tags: ["svelte"],
      },
      "B",
    );

    const { tags } = buildContent({ ...dirs, now: new Date("2024-01-01") });
    expect(tags).toEqual(["django", "svelte"]);
  });

  it("stamps the build date and package version into meta", () => {
    dirs = makeDirs();

    const { meta } = buildContent({ ...dirs, now: new Date("2024-03-15") });

    expect(meta.builtAt).toBe("2024-03-15");
    expect(meta.version).toBe(
      JSON.parse(fs.readFileSync("package.json", "utf-8")).version,
    );
  });
});
