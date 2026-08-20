// Reads content/posts/*.md, filters to what's actually published, and writes:
//   - src/generated/posts.json  (consumed by the Svelte app — see src/lib/posts.js)
//   - public/feed.xml           (static RSS feed, copied to the site root by Vite)
//
// This is the one place "published" is decided and the one place Markdown is rendered/sanitized
// — see .ai/decisions/ADR-0004-rewrite-as-static-vite-svelte-site.md for why this replaced
// Post.objects.published() + blog/markdown.py's render_markdown().
//
// Runs at build time only (invoked by the Vite plugin in vite.config.js, in both `vite` and
// `vite build`) — there is no server, so nothing here ever runs per-request.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

import { BASE_PATH, SITE_URL } from "../site.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "posts");
const OUT_DIR = path.join(ROOT, "src", "generated");
const PUBLIC_DIR = path.join(ROOT, "public");
const FEED_LIMIT = 20;
const EXCERPT_WORD_LIMIT = 30;
const REQUIRED_FIELDS = ["title", "slug", "author", "published_at"];

// Mirrors blog/markdown.py's bleach ALLOWED_TAGS/ALLOWED_ATTRIBUTES from the Django version of
// this project — same allowlist-over-blocklist reasoning: post bodies are written by trusted
// authors with repo write access, but sanitizing anyway is cheap insurance against a compromised
// account or a copy-pasted snippet containing something like a <script> tag.
const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "em",
  "b",
  "i",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

const ALLOWED_ATTRIBUTES = {
  a: ["href", "title", "rel"],
  img: ["src", "alt", "title"],
};

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateWords(text, wordLimit) {
  const words = text.split(" ").filter(Boolean);
  if (words.length <= wordLimit) return text;
  return `${words.slice(0, wordLimit).join(" ")}…`;
}

function escapeXml(str) {
  const entities = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  };
  return str.replace(/[<>&'"]/g, (c) => entities[c]);
}

function readPost(contentDir, file) {
  const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
  const { data, content } = matter(raw);

  const missing = REQUIRED_FIELDS.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw new Error(
      `content/posts/${file}: missing required frontmatter field(s): ${missing.join(", ")}`,
    );
  }

  const bodyHtml = sanitizeHtml(marked.parse(content), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
  });
  // Plain-text version of the body — used for search and the list-page excerpt so both work
  // against readable words rather than HTML tags or raw Markdown syntax.
  const bodyText = stripTags(bodyHtml);

  return {
    title: data.title,
    slug: data.slug,
    author: data.author,
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: data.status ?? "draft",
    publishedAt: data.published_at
      ? new Date(data.published_at).toISOString()
      : null,
    bodyHtml,
    bodyText,
    excerpt: truncateWords(bodyText, EXCERPT_WORD_LIMIT),
    sourceFile: file,
  };
}

function readAllPosts(contentDir) {
  if (!fs.existsSync(contentDir)) return [];
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => readPost(contentDir, file));

  const seenSlugs = new Map();
  for (const post of posts) {
    const clash = seenSlugs.get(post.slug);
    if (clash) {
      throw new Error(
        `Duplicate slug "${post.slug}" in ${clash} and ${post.sourceFile}`,
      );
    }
    seenSlugs.set(post.slug, post.sourceFile);
  }

  return posts;
}

/** Posts visible to the public: `status: published` and `published_at` in the past. */
function isPublished(post, now) {
  return (
    post.status === "published" &&
    post.publishedAt !== null &&
    new Date(post.publishedAt) <= now
  );
}

function buildFeedXml(posts) {
  const siteHome = `${SITE_URL}${BASE_PATH}`;
  const items = posts
    .slice(0, FEED_LIMIT)
    .map((post) => {
      const url = `${siteHome}#/posts/${post.slug}`;
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.bodyHtml}]]></description>
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog</title>
    <link>${siteHome}</link>
    <description>Latest published posts.</description>${items}
  </channel>
</rss>
`;
}

/**
 * Reads *.md from `contentDir` and (re)writes posts.json/feed.xml under `outDir`/`publicDir`.
 * Defaults to this repo's real content/posts + src/generated + public — tests override all
 * three so they run against isolated fixture files instead.
 */
export function buildContent({
  now = new Date(),
  contentDir = CONTENT_DIR,
  outDir = OUT_DIR,
  publicDir = PUBLIC_DIR,
} = {}) {
  const published = readAllPosts(contentDir)
    .filter((post) => isPublished(post, now))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    // sourceFile only matters for the duplicate-slug check above — drop it from the public data.
    .map(({ sourceFile: _sourceFile, ...post }) => post);

  const tags = [...new Set(published.flatMap((post) => post.tags))].sort();

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "posts.json"),
    JSON.stringify({ posts: published, tags }, null, 2),
  );

  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, "feed.xml"), buildFeedXml(published));

  return { posts: published, tags };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { posts } = buildContent();
  console.log(
    `Built ${posts.length} published post(s) -> src/generated/posts.json, public/feed.xml`,
  );
}
