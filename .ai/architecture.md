# Architecture

<!--
  This is the map an architecture agent starts from when it proposes a technical design, and
  the map an implementation agent uses to figure out where a change belongs. Keep it in sync
  with reality: the architecture agent is expected to update this file (and write an ADR under
  .ai/decisions/) whenever it makes a decision that changes the picture below. A diagram that
  lies is worse than no diagram.
-->

## Overview

Blog is a single Django monolith: one `web` process serves both the public site and the Django
admin (used by authors to write and publish posts), backed by a single PostgreSQL database.
There is no separate worker, queue, or cache — every request is handled synchronously by Django.

## Components

| Component | Responsibility | Tech | Repo path |
| --- | --- | --- | --- |
| `web` | Serves public post list/detail pages, the RSS feed, and the Django admin (post authoring) | Django 5.2 + gunicorn, static files via WhiteNoise | `config/`, `blog/` |
| `db` | Persistent storage for posts, tags, and authors (Django's `User` model) | PostgreSQL 17 | `docker-compose.yml` |

A reverse proxy / TLS termination (nginx, Caddy, or whatever the hosting platform provides) sits
in front of `web` in production but is not part of this repo — `web` itself serves plain HTTP.

## Data flow

Three representative flows:

- **Reading a post:** a browser `GET /posts/<slug>/` hits Django's URLconf, which routes to
  `blog.views.PostDetailView`. The view fetches the matching `Post` (404s if it doesn't exist or
  isn't `published`), renders its Markdown `body` to sanitized HTML, and renders
  `post_detail.html`.
- **Publishing a post:** an author logs into `/admin/`, creates or edits a `Post` through
  Django's built-in admin, and sets `status=published`. There is no custom authoring UI — the
  admin *is* the CMS.
- **Subscribing:** a `GET /feed/` hits `blog.feeds.LatestPostsFeed` (Django's syndication
  framework), which queries the latest `published` posts and serves them as RSS — no custom
  feed-rendering code needed.

```
Browser ──GET /posts/<slug>/──> Django URLconf ──> PostDetailView ──> Postgres (Post, Tag)
                                                          │
                                                          v
                                                   post_detail.html

Author ──login /admin/──> Django admin ──> Postgres (Post, Tag, User)

Reader ──GET /feed/──> LatestPostsFeed ──> Postgres ──> RSS XML
```

## Key design decisions

No ADRs recorded yet — this is a greenfield project. The first `@architecture` run on a real
issue should add entries here as decisions are made (see `.ai/decisions/ADR-0001-template.md`).

## External dependencies

None yet. This is a self-contained Django + PostgreSQL application with no third-party runtime
services. If a future feature needs one (e.g. an SMTP relay for author notifications, or object
storage for images), add a row here describing what happens if it's unavailable.

## Known limitations

- Single Postgres instance is a single point of failure — acceptable at current scale; would
  need a managed/replicated database before this could tolerate a DB outage.
- No caching layer, so every request hits the database directly — fine at low-to-moderate
  traffic, but a post going viral would need caching (e.g. per-view or template-fragment
  caching) added before it became a problem.
- No image/media pipeline yet — post bodies are Markdown text only; embedding images would need
  `MEDIA_ROOT`/object storage decisions made first.
