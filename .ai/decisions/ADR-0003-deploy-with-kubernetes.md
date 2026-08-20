# ADR-0003: Deploy the `web` service to Kubernetes

## Status

Superseded by [ADR-0004](ADR-0004-rewrite-as-static-vite-svelte-site.md) — there is no longer a
`web` service or a cluster to deploy it to; kept as historical record (including of the
GitHub-runner-to-cluster networking trouble that partly motivated moving away from this).

**Date:** 2026-08-20

## Context

`.ai/project.md` previously stated the infra target as Docker Compose on a single small VPS, and
explicitly called out "no Kubernetes/Nomad/multi-region setup" as a key constraint — a reasonable
default for a project this size, but not a requirement anyone had actually tested against a real
deployment target. The project now needs to run on Kubernetes instead, with GitHub Actions
building the image, pushing it to a registry, and rolling it out on every change to `main`. This
reverses that specific constraint; it does not change anything else about the project's stated
philosophy of running "the smallest system that can do the job well" — the Kubernetes setup
introduced here is deliberately minimal (see "Decision" below), not a jump to a full
microservices/multi-service topology.

This also interacts directly with `.ai/decisions/ADR-0002-use-sqlite-instead-of-postgres.md`:
SQLite allows one writer at a time and its file lives on a single volume, which constrains what a
Kubernetes deployment of this app can safely do (see "Consequences").

## Decision

Add `k8s/` manifests (plain Kubernetes YAML, assembled with Kustomize) and
`.github/workflows/deploy.yml`:

- **Image build/push:** on every push to `main` that passes CI (`ci.yml`), a `build-and-push`
  job builds the existing `Dockerfile` and pushes it to GitHub Container Registry
  (`ghcr.io/kchudy/blog`), tagged with both the commit SHA and `latest`.
- **Deploy:** a `deploy` job then applies `k8s/` (`kubectl apply -k`) to a cluster reachable via a
  kubeconfig stored in the `KUBE_CONFIG` repository secret, pins the just-built image tag, and
  waits for the rollout to finish.
- **Topology:** a single `web` Deployment (**1 replica**, `strategy: Recreate`) with an
  `initContainer` running `manage.py migrate` before gunicorn starts, a `PersistentVolumeClaim`
  for the SQLite file, and a ClusterIP `Service` — no Ingress yet, added later once there's a
  real hostname to route.
- `docker-compose.yml` is unchanged and remains the tool for local development; Kubernetes is
  purely the deployment target.

See `k8s/README.md` for the one-time cluster setup (secrets, hostname, image pull access) this
requires.

## Alternatives considered

- **Stay on Docker Compose on a single VPS** — simpler, and was the previously documented target,
  but rejected because the project now needs the specific things Kubernetes gives it (declarative
  rollouts, restart/health-check semantics, a path to a managed cluster) rather than hand-managed
  `docker compose up` on a VPS.
- **A PaaS (Fly.io, Render, Railway, etc.)** — would have meant less YAML to maintain, but was
  rejected in favor of Kubernetes per direct instruction; not evaluated further.
- **Multi-replica Deployment with Postgres reinstated** — would give horizontal scaling and
  remove the single-writer constraint, but was rejected for now: nothing about this project's
  traffic level needs it yet, and it would reopen ADR-0002. Revisit if that changes.

## Consequences

- The `web` Deployment is intentionally capped at 1 replica with `strategy: Recreate` — a
  RollingUpdate would briefly run two pods against the same `ReadWriteOnce` SQLite volume, which
  risks corrupting the database file. This means no k8s-native horizontal scaling or zero-downtime
  deploys for `web` (there's a short gap between the old pod terminating and the new one becoming
  ready) until the datastore decision is revisited.
- New operational surface: a cluster to keep patched, a `KUBE_CONFIG` secret to rotate, and
  (if the GHCR package stays private) a `GHCR_PAT` secret to keep current — see `k8s/README.md`.
  This is more moving parts than the previous Compose-on-a-VPS setup, accepted as the cost of the
  requested move.
- `DJANGO_SECRET_KEY` is deliberately kept out of both the repo and CI — created directly in the
  cluster once (`k8s/secret.example.yaml`) rather than templated through a GitHub secret, to keep
  its blast radius smaller.
- If traffic or availability needs eventually require more than one `web` replica, that requires
  first revisiting ADR-0002 (moving off SQLite to a networked database), not raising `replicas`
  on this Deployment.

## References

- Related issue(s): none — requested directly, not tracked as a Plane issue
- Related ADR(s): ADR-0002 (SQLite's single-writer model shapes this ADR's replica/strategy choice)
- External links: none
