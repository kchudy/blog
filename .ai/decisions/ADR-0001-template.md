# ADR-0001: [Short, specific decision title]

<!--
  This is the ADR (Architecture Decision Record) template. It is not itself a real decision —
  don't fill this file in. Instead, copy it to a new sequentially-numbered file when a real
  decision is made:

    cp .ai/decisions/ADR-0001-template.md .ai/decisions/ADR-000N-short-kebab-slug.md

  ...where N is one more than the highest ADR number already present in this directory. The
  `@architecture` agent follows this same rule automatically (see .ai/prompts/architecture.md).
  Give the file a slug describing the decision, e.g. `ADR-0003-use-server-side-pagination.md`.

  Write it so a future reader with none of the current context can understand it cold — that's
  the entire point of an ADR. Delete these guidance comments in the real copy.
-->

## Status

[Proposed | Accepted | Superseded by ADR-000N | Deprecated]

<!-- Date this status was set. -->
**Date:** [YYYY-MM-DD]

## Context

[What is the problem or situation that requires a decision? What forces are at play —
technical constraints, product requirements, team constraints, prior decisions this
interacts with? Write this as if the reader has none of the conversation that led here —
they should be able to understand *why this decision needed to be made at all* from this
section alone.]

## Decision

[The decision itself, stated plainly and specifically. Not "we will consider X" — state what
was actually decided. If there's a concrete mechanism (a specific library, a specific schema
change, a specific API shape), name it.]

## Alternatives considered

<!-- Optional but strongly recommended when there was a real choice. Delete if there wasn't. -->

- **[Alternative A]** — [why it was not chosen]
- **[Alternative B]** — [why it was not chosen]

## Consequences

[What becomes easier or harder as a result of this decision? Include the honest downsides, not
just the benefits — e.g. new dependency to maintain, a migration required, a constraint this
now places on future work. If this decision should be revisited under some condition (e.g. "if
traffic exceeds X" or "once library Y hits 1.0"), say so explicitly.]

## References

- Related issue(s): [Plane issue id(s)]
- Related ADR(s): [ADR-000N, if any]
- External links: [RFC, library docs, benchmark, etc., if any]
