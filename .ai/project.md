# Project

<!--
  This file is the first thing every AI agent (requirements, architecture, implementation,
  review, qa) reads before touching this repository. Keep it short, current, and concrete —
  a stale "purpose" section is worse than none, because agents will trust it. The requirements
  agent is explicitly allowed to update this file when a conversation reveals it's out of date;
  humans should feel just as free to.
-->

## What this project is

Blog is a self-hosted, Django-based publishing platform for long-form articles. It gives a
small team of authors a Django-admin-based editor for writing and publishing posts, and serves
a public-facing site for browsing, reading, and subscribing (via RSS) to what's been published.

## Purpose / problem it solves

Existing options force a tradeoff: third-party platforms (Medium, Substack) mean giving up
ownership of content and audience data, while general-purpose CMSes (Wagtail, WordPress) bring
far more machinery than a simple blog needs. This project exists to give a small team full
control over its content and hosting, with the smallest system that can do the job well — posts,
tags, an admin UI, and an RSS feed, nothing more. Success looks like: an author can write and
publish a post in Markdown without touching code, and a reader can browse or subscribe to new
posts without needing JavaScript.

## Stack

- **Language(s):** Python 3.12
- **Framework(s):** Django 5.2 (LTS)
- **Datastore(s):** SQLite via the Django ORM, its file held on a Docker volume — no cache or
  queue at this scale (see `.ai/decisions/ADR-0002-use-sqlite-instead-of-postgres.md`)
- **Package manager:** uv (`pyproject.toml` + `uv.lock`)
- **Infra / deployment target:** Kubernetes — a single-replica `web` Deployment (see
  `.ai/decisions/ADR-0003-deploy-with-kubernetes.md`), manifests under `k8s/`; gunicorn serves
  Django, WhiteNoise serves static files directly — no separate app server, database container,
  or CDN. `docker-compose.yml` remains for local development only.
- **CI/CD:** GitHub Actions — `.github/workflows/ci.yml` (lint + test on every push/PR) and
  `.github/workflows/deploy.yml` (build image, push to GHCR, deploy to Kubernetes on `main`)

## Key constraints

- No caching layer, task queue, or background worker (no Redis/Celery) — deliberate, for a
  low-to-moderate-traffic blog. Revisit only if a real feature needs async work (e.g. sending
  email) or read traffic outgrows what a single SQLite file can serve.
- Server-rendered Django templates only — no SPA/JS framework. Light, unobtrusive JS (or htmx,
  if a future feature genuinely needs it) is fine; a client-side build pipeline is not.
- No comments system — deliberately out of scope to avoid spam/moderation overhead. External
  discussion (social media, etc.) is an acceptable substitute.
- Runs as a single `web` container/pod with an embedded SQLite database, no separate database
  container — deliberately minimal even on Kubernetes (see
  `.ai/decisions/ADR-0003-deploy-with-kubernetes.md`); no multi-region setup.
- Authors are trusted, internal users created via Django admin — no public sign-up or untrusted
  content submission.

## Repository layout

| Path | What lives there |
| --- | --- |
| `manage.py` | Django management entry point |
| `config/` | Project-level settings, root URLconf, WSGI/ASGI entry points |
| `blog/` | The main (and, for now, only) app: `Post`/`Tag` models, views, forms, feeds, templates, and its own `tests/` |
| `templates/` | Shared/base templates (`base.html`, layout partials) that `blog/` templates extend |
| `static/` | Project-wide static assets (CSS, images), collected via `collectstatic` |
| `.github/workflows/` | CI and CI/CD (build/push/deploy) pipeline definitions |
| `k8s/` | Kubernetes manifests (Kustomize) for the deployed `web` service |

## Links

- Issue tracker: not yet set up — record the Plane workspace/project URL here once created.
- Design docs: none beyond this `.ai/` directory yet.
- Deployed environments: not yet deployed — record staging/production URLs here once live.
- Runbook / on-call: none yet — single small deployment, not yet needed.

## Glossary

- **Post**: A single article — has a title, a unique `slug`, a Markdown `body`, an `author`,
  zero or more `tags`, and a `status` (`draft` or `published`).
- **Draft / Published**: A post's two lifecycle states. Only `published` posts (with a
  `published_at` in the past) appear on public pages and the RSS feed.
- **Tag**: A short label used to group related posts; a post can have several.
- **Feed**: The site's RSS feed (`/feed/`), served via Django's syndication framework, listing
  recent published posts.
