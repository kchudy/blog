# ADR-0002: Use SQLite instead of PostgreSQL

## Status

Accepted

**Date:** 2026-08-20

## Context

The project originally deployed as two Docker Compose services: a `web` container running
Django/gunicorn and a `db` container running PostgreSQL 17, with `web` depending on `db`'s
healthcheck before running migrations and serving traffic. Nothing in the application actually
needs PostgreSQL: `.ai/project.md` sets the bar at "the smallest system that can do the job
well," the project deliberately has no cache or task queue, is meant to run comfortably on a
single small VPS, and expects low-to-moderate traffic from a small team of authors. The one
place Postgres-specific behavior could have mattered — search — already uses a plain
`icontains` query (see `blog/models.py`) rather than Postgres full-text search, precisely so
the sqlite backend the test suite runs against behaves identically to production. Running a
separate database server and volume for a workload this size is more operational surface
(a second container to monitor, back up, and keep patched) than the project needs.

## Decision

Drop the `db` service from `docker-compose.yml` entirely. The `web` service now uses SQLite via
the Django ORM in every environment — local development, tests/CI, and the deployed container.
`docker-compose.yml` sets `DATABASE_URL=sqlite:////data/db.sqlite3` and mounts a named volume at
`/data` so the database file persists across container recreation; `config/settings.py` was
already reading `DATABASE_URL` through `django-environ`'s `env.db()` with a local-file SQLite
default, so no application code changed. The `psycopg` dependency was dropped from
`pyproject.toml`/`uv.lock`.

## Alternatives considered

- **Keep PostgreSQL** — rejected: no feature in this project depends on it, and it's a second
  process to run, monitor, and back up for no benefit at current scale.
- **Managed/hosted Postgres (e.g. RDS)** — rejected for the same reason, plus it reintroduces an
  external dependency and cost the project's stated infra target (a single small VPS) doesn't
  call for.

## Consequences

- One less container in `docker-compose.yml`; simpler local setup and deployment (no
  `depends_on`/healthcheck wiring, no Postgres credentials to manage).
- SQLite serializes writes (one writer at a time) and lives as a single file on one Docker
  volume — fine for one `web` process at this project's traffic level, but this decision needs
  revisiting before running multiple `web` replicas or before write concurrency becomes a
  bottleneck. See `.ai/architecture.md`'s "Known limitations."
- Backups now mean backing up one file on the `sqlite_data` volume rather than a Postgres dump —
  simpler, but worth confirming the deployment host's volume backup strategy actually covers it.
- If a future feature genuinely needs Postgres-only behavior (e.g. real full-text search,
  concurrent-write-heavy workloads), that's a reason to revisit this ADR, not to quietly bolt
  Postgres-specific code onto a SQLite-tested codebase.

## References

- Related issue(s): none — requested directly, not tracked as a Plane issue
- Related ADR(s): none
- External links: none
