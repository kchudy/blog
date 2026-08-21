# Project

<!--
  This file is the first thing every AI agent (requirements, architecture, implementation,
  review, qa) reads before touching this repository. Keep it short, current, and concrete —
  a stale "purpose" section is worse than none, because agents will trust it. The requirements
  agent is explicitly allowed to update this file when a conversation reveals it's out of date;
  humans should feel just as free to.
-->

## What this project is

Blog is a self-hosted, static publishing platform for long-form articles, built with Vite and
Svelte and deployed to GitHub Pages. Posts are Markdown files in this repo; "publishing" a post
means opening a pull request. The built site serves a public-facing site for browsing, reading,
and subscribing (via RSS) to what's been published — there is no server, database, or admin login.

## Purpose / problem it solves

Existing options force a tradeoff: third-party platforms (Medium, Substack) mean giving up
ownership of content and audience data, while general-purpose CMSes (Wagtail, WordPress) bring
far more machinery than a simple blog needs. This project exists to give a small team full
control over its content and hosting, with the smallest system that can do the job well — posts,
tags, a Markdown-file-based authoring workflow, and an RSS feed, nothing more. Success looks like:
an author can write and publish a post in Markdown via a pull request, and a reader can browse or
subscribe to new posts without needing an account or any server-side infrastructure to exist.

## Stack

- **Language(s):** JavaScript
- **Framework(s):** Svelte 5 (runes) + Vite
- **Datastore(s):** None — post content is Markdown files under `content/posts/`, compiled into
  `src/generated/posts.json` and `public/feed.xml` at build time (see
  `scripts/build-content.js` and `.ai/decisions/ADR-0004-rewrite-as-static-vite-svelte-site.md`).
  `localStorage` holds only per-browser state that was never meant to be shared — theme
  preference and read-post tracking (`src/lib/storage.svelte.js`) — never post content.
- **Package manager:** npm (`package.json` + `package-lock.json`)
- **Infra / deployment target:** GitHub Pages — a fully static site, no server process, container,
  or cluster of any kind
- **CI/CD:** GitHub Actions — `.github/workflows/ci.yml` (lint + test on every push/PR) and
  `.github/workflows/deploy.yml` (build + deploy to GitHub Pages on `main`, via
  `actions/deploy-pages` — no secrets required)

## Key constraints

- No caching layer, task queue, or background worker — there's no server at all to run one on.
- Server-rendered anything is off the table by construction (GitHub Pages serves static files
  only); the whole app is client-rendered Svelte. A hash-based router
  (`src/lib/router.svelte.js`) avoids needing a path-rewrite fallback trick on a static host.
- No comments system — deliberately out of scope to avoid spam/moderation overhead. External
  discussion (social media, etc.) is an acceptable substitute.
- No login, no admin UI, no in-browser post editor. Authoring is git: add/edit a Markdown file
  under `content/posts/` and open a pull request. Repo write/review access is the trust boundary
  that used to be Django admin login.
- A post's `published_at` being in the past only takes effect the next time the site is actually
  built and deployed — there's no scheduler that rebuilds the site exactly when a future date
  arrives (see `.ai/decisions/ADR-0004-rewrite-as-static-vite-svelte-site.md`'s "Consequences").

## Repository layout

| Path                       | What lives there                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `content/posts/`           | Post content — one Markdown file per post, frontmatter + Markdown body                                                                |
| `scripts/build-content.js` | Reads `content/posts/`, decides what's published, renders/sanitizes Markdown, writes `src/generated/posts.json` and `public/feed.xml` |
| `site.config.js`           | Shared `SITE_URL`/`BASE_PATH` constants (GitHub Pages project-site path)                                                              |
| `src/`                     | The Svelte app: `App.svelte`, `lib/` (router, posts querying, localStorage, components)                                               |
| `vite.config.js`           | Vite config, including the plugin that runs `build-content.js` before dev/build                                                       |
| `.github/workflows/`       | CI (`ci.yml`) and CI/CD (`deploy.yml`, build + deploy to GitHub Pages) definitions                                                    |

## Links

- Issue tracker: not yet set up — record the Plane workspace/project URL here once created.
- Design docs: none beyond this `.ai/` directory yet.
- Deployed environments: not yet deployed — record the GitHub Pages URL here once live.
- Runbook / on-call: none yet — a static site with no server has no on-call story to speak of.

## Glossary

- **Post**: A single article — a Markdown file under `content/posts/` with frontmatter for
  `title`, a unique `slug`, `author`, zero or more `tags`, and a `status` (`draft` or
  `published`).
- **Draft / Published**: A post's two lifecycle states. Only `published` posts (with a
  `published_at` in the past, as of the last build) appear on public pages and the RSS feed.
- **Tag**: A short label used to group related posts; a post can have several.
- **Feed**: The site's RSS feed (`/feed.xml`), generated at build time from the latest published
  posts.
