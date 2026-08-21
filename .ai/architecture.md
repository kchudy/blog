# Architecture

<!--
  This is the map an architecture agent starts from when it proposes a technical design, and
  the map an implementation agent uses to figure out where a change belongs. Keep it in sync
  with reality: the architecture agent is expected to update this file (and write an ADR under
  .ai/decisions/) whenever it makes a decision that changes the picture below. A diagram that
  lies is worse than no diagram.
-->

## Overview

Blog is a static site: a Svelte 5 app, built by Vite, deployed to GitHub Pages. There is no
server, database, or container of any kind — "the backend" is a build step
(`scripts/build-content.js`) that turns Markdown files in this repo into JSON/RSS the client-side
app reads. See `.ai/decisions/ADR-0004-rewrite-as-static-vite-svelte-site.md` for the full
reasoning and what this replaced (a Django + SQLite app on Kubernetes).

## Components

| Component         | Responsibility                                                                                     | Tech                                                                          | Repo path                                    |
| ----------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------- |
| `content/posts/`  | Source of truth for post content — one Markdown file per post, with frontmatter                    | Markdown + YAML frontmatter                                                   | `content/posts/`                             |
| Content build     | Decides what's published, renders Markdown → sanitized HTML, writes the data the app and feed need | Node script (`gray-matter`, `marked`, `sanitize-html`), run via a Vite plugin | `scripts/build-content.js`, `vite.config.js` |
| App               | Renders the post list/search/tag views and a post detail view; hash-based client-side routing      | Svelte 5 (runes) + Vite                                                       | `src/`                                       |
| Per-browser state | Theme preference and which posts this browser has read — never post content                        | `localStorage`                                                                | `src/lib/storage.svelte.js`                  |
| Static hosting    | Serves the built `dist/` output                                                                    | GitHub Pages                                                                  | `.github/workflows/deploy.yml`               |

## Data flow

Three representative flows:

- **Reading a post:** a browser navigates to `#/posts/<slug>`; `src/lib/router.svelte.js` parses
  the hash and `App.svelte` renders `PostDetailPage`, which looks the slug up in the build-time-
  generated `src/generated/posts.json` (already filtered to published posts — an unknown or
  unpublished slug renders the same "not found" view) and renders its pre-sanitized HTML body.
- **Publishing a post:** someone adds or edits a Markdown file under `content/posts/` with
  `status: published` and opens a pull request. Once merged to `main`, `deploy.yml` rebuilds the
  site (`scripts/build-content.js` re-decides what's published) and redeploys to GitHub Pages —
  there is no admin UI or login; repo write/review access is the authoring permission.
- **Subscribing:** `scripts/build-content.js` writes `public/feed.xml` from the latest published
  posts at build time; GitHub Pages serves it as a static file at `/feed.xml` — no per-request
  feed generation, because there's no server to do it on.

```
content/posts/*.md ──build-content.js──> src/generated/posts.json ──> Svelte app ──> browser
                                     └───> public/feed.xml ──> served as a static file

Browser #/posts/<slug> ──router.svelte.js──> PostDetailPage ──findBySlug──> posts.json
Browser #/?q=... ───────router.svelte.js──> PostListPage ────search─────> posts.json
```

## Key design decisions

- **Rewrite as a static Vite + Svelte site, deployed to GitHub Pages** — see
  `.ai/decisions/ADR-0004-rewrite-as-static-vite-svelte-site.md`. Supersedes ADR-0002 (SQLite)
  and ADR-0003 (Kubernetes), both now historical record only.

## External dependencies

- **Google Fonts** (`fonts.googleapis.com`) — the post index's Defguard-based design (BLOG-2)
  loads Inter + JetBrains Mono via a CSS `@import` in `src/app.css`. If unreachable, the
  `font-family` stack falls back to `system-ui`/`ui-monospace` — layout and function are
  unaffected, only the typeface changes. No other third-party runtime services: GitHub Pages
  serves the built output directly. If a future feature needs one (e.g. a comments widget,
  analytics), add a row here describing what happens if it's unavailable, and weigh it against
  `.ai/project.md`'s "no comments system" / "smallest system that can do the job well" stance.

## Known limitations

- **Publishing isn't instant.** A merged post goes live only after the next `deploy.yml` run
  finishes (typically a couple of minutes) — there's no live admin preview. A `published_at` in
  the future also only takes effect the next time the site happens to be rebuilt for some other
  reason; there's no scheduled rebuild yet. Add one (a scheduled GitHub Actions workflow) if
  "publish exactly on time" becomes a real requirement.
- **Search ships every published post's text to the client.** Fine at this project's scale
  (client-side substring match, see `src/lib/posts.js`); would need a real search index or
  pagination of the underlying data if the post count grew large enough to make the JS bundle
  unreasonably big.
- **No authoring UI.** Writing a post means editing a Markdown file and opening a PR — there is no
  in-browser editor, draft preview, or login. Fine for a small team comfortable with git; would
  need revisiting (see ADR-0004's "Alternatives considered") if a non-technical author needed to
  publish without help.
- **`localStorage` state is per-browser by design**, not a bug: clearing site data or switching
  devices loses theme preference and read-post tracking. Nothing more important than that is
  meant to live there — see ADR-0004's "Context" for why post content specifically cannot.
- No image/media pipeline — post bodies are Markdown text (with `<img>` allowed if it points at an
  externally-hosted image); embedding uploaded images would need an asset pipeline decision made
  first.
