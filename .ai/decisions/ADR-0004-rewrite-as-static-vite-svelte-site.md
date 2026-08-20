# ADR-0004: Rewrite as a static Vite + Svelte site on GitHub Pages

## Status

Accepted — supersedes ADR-0002 and ADR-0003 in full.

**Date:** 2026-08-20

## Context

Blog was a Django monolith: gunicorn served both the public site and the Django admin (used by
authors to write and publish posts), backed by SQLite (ADR-0002) and deployed as a single-replica
Kubernetes Deployment (ADR-0003) built and rolled out by GitHub Actions. That Kubernetes rollout
turned out to depend on a privately-firewalled cluster that GitHub-hosted runners could not
reliably reach — the deploy path itself became the project's biggest source of operational
trouble, on a project whose own stated philosophy (`.ai/project.md`) is "the smallest system that
can do the job well."

Separately, the project needed to move off any server process entirely: no Django, no gunicorn,
no container, no cluster to keep reachable. The replacement stack is Vite + Svelte, using the
browser's `localStorage` for what state the app keeps, deployed to GitHub Pages.

That last part needed its own scoping, because taken literally it conflicts with what this
project is for: `.ai/project.md` describes a small team of authors publishing posts that _any_
reader can browse and subscribe to. `localStorage` is private to one browser on one device — it
cannot be where something meant for every reader lives. GitHub Pages only serves static files, so
there is also no server left to run an admin UI or an authoring API. Both had to be resolved
before "use localStorage, deploy to GitHub Pages" was a coherent architecture rather than a
contradiction of the project's own purpose.

## Decision

- **Post content lives as Markdown files in the repo** (`content/posts/*.md`, frontmatter for
  `title`/`slug`/`author`/`tags`/`status`/`published_at`), not in any datastore. `authoring` a
  post now means adding/editing a file and opening a PR — repo write/review access _is_ the
  authoring permission that Django admin login used to be. This is what keeps posts visible to
  every reader: they're baked into the built site at build time, not read from any one visitor's
  browser.
- **`scripts/build-content.js`** (invoked by a Vite plugin in `vite.config.js`, in both `vite` and
  `vite build`) is the single place "published" is decided (`status: published` and
  `published_at` in the past — the same rule as the old `PostQuerySet.published()`) and the single
  place Markdown is rendered to sanitized HTML (`marked` + `sanitize-html`, replacing
  `blog/markdown.py`'s `markdown` + `bleach`). It writes `src/generated/posts.json` (consumed by
  the Svelte app) and `public/feed.xml` (a build-time-generated static RSS feed, replacing
  `blog.feeds.LatestPostsFeed`).
- **`localStorage` holds only per-browser state that was never meant to be shared**: theme
  preference and which posts this browser has read (`src/lib/storage.svelte.js`). Nothing a
  reader needs from another reader, or an author needs another author to see, lives there.
- **Routing is a minimal hand-rolled hash router** (`src/lib/router.svelte.js`, `#/`,
  `#/posts/:slug`, `#/?q=`/`?tag=`/`?page=`) rather than a routing library or path-based routing —
  hash fragments never reach the server, so GitHub Pages needs no fallback-page rewrite trick for
  this to work, unlike path-based SPA routing would.
- **CI/CD is `.github/workflows/ci.yml`** (lint + test on every push/PR) **and
  `.github/workflows/deploy.yml`** (build, then GitHub's own `actions/deploy-pages` action) on
  push to `main`. No registry, no image, no kubeconfig, no cluster — the entire class of problems
  ADR-0003 ran into no longer applies.
- `docker-compose.yml`, `Dockerfile`, `k8s/`, `pyproject.toml`/`uv.lock`, and the Django app
  (`blog/`, `config/`, `manage.py`) are removed outright, not kept alongside the new stack.

## Alternatives considered

- **Fix the Kubernetes networking problem instead** — rejected: even a working deploy path would
  still leave a cluster, a database, and a container to operate for a project whose actual
  requirements (a small team publishing occasional long-form posts) don't need any of that.
- **`localStorage` as the actual datastore for posts** — rejected outright: it cannot make a post
  visible to any reader other than the browser that wrote it, which directly contradicts this
  project's purpose. Considered and rejected before any implementation started (see the
  conversation this ADR was written from) rather than discovered as a bug later.
- **Path-based SPA routing with a GitHub Pages `404.html` fallback** — a more conventional
  approach, but hash-based routing needs no such trick and works identically on any static host;
  rejected as unnecessary complexity for a project this size.
- **A headless CMS or a git-backed CMS UI (e.g. Netlify CMS/Decap)** for authoring — would give
  non-technical authors a form-based editor, but adds a dependency and a build step of its own for
  a "small team" that ADR context suggests is comfortable with a PR-based workflow; revisit if a
  future author genuinely can't work with Markdown files directly.

## Consequences

- No server-side anything: no container to patch, no cluster to keep reachable, no database to
  back up. GitHub Pages deployment has no secrets to manage at all (`actions/deploy-pages` uses
  GitHub's own OIDC-based flow) — a real simplification after ADR-0003's kubeconfig/network
  troubles.
- Publishing a post now requires a build + deploy (a GitHub Actions run, typically a couple of
  minutes) rather than an admin-panel save taking effect immediately. Scheduling a future
  `published_at` also requires _something_ to rebuild the site after that time passes — there is
  no cron here yet, so a future-dated post goes live only the next time `main` is built for an
  unrelated reason. Add a scheduled workflow run if "publish exactly on time" becomes a real
  requirement.
- No login, no draft preview UI, no in-browser authoring — authoring is git, full stop. A
  non-technical author needs someone comfortable with Markdown/PRs to help, same tradeoff noted
  under "Alternatives considered."
- `localStorage`-backed features (theme, read-tracking) are inherently per-browser: clearing site
  data, or reading from a different device, loses them. This is expected and fine for what they're
  used for, not a bug — see "Context" above for why nothing more important than that lives there.
- Search is a client-side substring match over every published post's text, shipped in the JS
  bundle — fine at this project's scale; would need revisiting (pagination of the data itself, or
  a real search index) if the number of posts grew enough to make the bundle unreasonably large.

## References

- Related issue(s): none — requested directly, not tracked as a Plane issue
- Related ADR(s): supersedes ADR-0002 (SQLite) and ADR-0003 (Kubernetes) — both are now historical
  record only, not the current architecture
- External links: [Vite](https://vite.dev), [Svelte](https://svelte.dev),
  [actions/deploy-pages](https://github.com/actions/deploy-pages)
