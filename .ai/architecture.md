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
admin (used by authors to write and publish posts), backed by an embedded SQLite database file
held on a persistent volume. There is no separate database process, worker, queue, or cache —
every request is handled synchronously by Django against the local file
(see `.ai/decisions/ADR-0002-use-sqlite-instead-of-postgres.md`). It runs as a single-replica
Kubernetes Deployment (see `.ai/decisions/ADR-0003-deploy-with-kubernetes.md`);
`docker-compose.yml` covers local development only.

## Components

| Component | Responsibility | Tech | Repo path |
| --- | --- | --- | --- |
| `web` | Serves public post list/detail pages, the RSS feed, the Django admin (post authoring), and holds the SQLite database file on a mounted PersistentVolume | Django 5.2 + gunicorn, static files via WhiteNoise, SQLite via the Django ORM | `config/`, `blog/`, `k8s/` |

A reverse proxy / TLS termination (nginx, Caddy, or whatever the hosting platform provides) sits
in front of `web` in production but is not part of this repo — `web` itself serves plain HTTP;
`k8s/service.yaml` is ClusterIP-only until an Ingress is added.

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
Browser ──GET /posts/<slug>/──> Django URLconf ──> PostDetailView ──> SQLite (Post, Tag)
                                                          │
                                                          v
                                                   post_detail.html

Author ──login /admin/──> Django admin ──> SQLite (Post, Tag, User)

Reader ──GET /feed/──> LatestPostsFeed ──> SQLite ──> RSS XML
```

## Key design decisions

- **Use SQLite instead of PostgreSQL** — see
  `.ai/decisions/ADR-0002-use-sqlite-instead-of-postgres.md`. Drops the separate `db` container
  in favor of a single `web` container with its database file on a mounted volume.
- **Deploy to Kubernetes** — see `.ai/decisions/ADR-0003-deploy-with-kubernetes.md`. A
  single-replica `web` Deployment (`k8s/`), built and rolled out by
  `.github/workflows/deploy.yml` on every `main` push that passes CI.

## External dependencies

None yet. This is a self-contained Django + SQLite application with no third-party runtime
services. If a future feature needs one (e.g. an SMTP relay for author notifications, or object
storage for images), add a row here describing what happens if it's unavailable.

## Known limitations

- SQLite serializes writes (one writer at a time) and the database file lives on a single
  PersistentVolume with no built-in replication — acceptable at current scale (one `web`
  process, low-to-moderate write volume); would need to move back to a networked database before
  this could run multiple `web` replicas or tolerate the volume's underlying disk failing. This
  is also why the Kubernetes Deployment is pinned to 1 replica with `strategy: Recreate` rather
  than a RollingUpdate (see `.ai/decisions/ADR-0003-deploy-with-kubernetes.md`).
- No caching layer, so every request hits the database directly — fine at low-to-moderate
  traffic, but a post going viral would need caching (e.g. per-view or template-fragment
  caching) added before it became a problem.
- No image/media pipeline yet — post bodies are Markdown text only; embedding images would need
  `MEDIA_ROOT`/object storage decisions made first.
