# Architecture

<!--
  This is the map an architecture agent starts from when it proposes a technical design, and
  the map an implementation agent uses to figure out where a change belongs. Keep it in sync
  with reality: the architecture agent is expected to update this file (and write an ADR under
  .ai/decisions/) whenever it makes a decision that changes the picture below. A diagram that
  lies is worse than no diagram.
-->

## Overview

[2-4 sentences: the shape of the system at the highest level — e.g. "a single Next.js app
backed by a Postgres database, with a separate worker process for async jobs, all behind an
nginx reverse proxy."]

## Components

<!-- One entry per deployable/runnable unit. Add or remove rows freely. -->

| Component | Responsibility | Tech | Repo path |
| --- | --- | --- | --- |
| [e.g. `web`] | [e.g. serves the UI and REST API] | [e.g. Next.js] | [`apps/web`] |
| [e.g. `worker`] | [e.g. processes background jobs from the queue] | [e.g. Python] | [`apps/worker`] |
| [...] | [...] | [...] | [...] |

## Data flow

[Describe how a representative request or event moves through the system, end to end — e.g.
"a browser POST hits `web`'s `/api/orders` route, which validates the payload, writes to
Postgres, and publishes an `order.created` event to Redis; `worker` consumes that event and
sends the confirmation email." Prefer describing 1-2 real flows over an abstract diagram —
concrete beats generic here. Add a diagram (mermaid or otherwise) if the team maintains one.]

```
[optional ascii/mermaid diagram]
```

## Key design decisions

<!--
  Short pointers, not full explanations — the "why" belongs in an ADR under .ai/decisions/
  (see decisions/ADR-0001-template.md). This section is an index, so a reader can quickly find
  which decisions shaped the current shape of things without re-deriving them.
-->

- [Decision summary] — see `.ai/decisions/ADR-000N-*.md`
- [Decision summary] — see `.ai/decisions/ADR-000N-*.md`

## External dependencies

<!-- Third-party services/APIs this system talks to at runtime, and what happens if each is down. -->

| Dependency | Used for | Failure mode / fallback |
| --- | --- | --- |
| [e.g. Stripe] | [e.g. payment processing] | [e.g. checkout disabled, queued retries] |
| [...] | [...] | [...] |

## Known limitations

<!--
  Architectural weaknesses the team has accepted for now (not bugs — see
  knowledge/known-issues.md for those). E.g. "single point of failure in X", "no horizontal
  scaling of Y yet", "N+1 query pattern in Z, acceptable at current traffic."
-->

- [Limitation 1]
- [Limitation 2]
