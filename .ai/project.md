# Project

<!--
  This file is the first thing every AI agent (requirements, architecture, implementation,
  review, qa) reads before touching this repository. Keep it short, current, and concrete —
  a stale "purpose" section is worse than none, because agents will trust it. The requirements
  agent is explicitly allowed to update this file when a conversation reveals it's out of date;
  humans should feel just as free to.
-->

## What this project is

[PROJECT NAME] is [one or two sentences describing what the product/service does and who it's
for — the "elevator pitch" a new engineer would get on day one].

## Purpose / problem it solves

[What problem does this exist to solve? What happens if it didn't exist? 2-4 sentences —
enough that an agent proposing a design knows what "success" means, not just what "done" means.]

## Stack

<!-- List the load-bearing technology choices, not every dependency. -->

- **Language(s):** [e.g. TypeScript, Python 3.12]
- **Framework(s):** [e.g. Next.js 14 (App Router), FastAPI]
- **Datastore(s):** [e.g. PostgreSQL 16 via Prisma, Redis for caching/sessions]
- **Package manager:** [e.g. npm, pnpm, uv]
- **Infra / deployment target:** [e.g. Docker Compose on a single VPS, AWS ECS, Vercel]
- **CI:** [e.g. GitHub Actions — link the workflow file]

## Key constraints

<!--
  Things that shape every design decision but aren't obvious from the code. Examples:
  compliance requirements, supported browser/OS matrix, latency/SLA budgets, an explicit
  decision NOT to use some common tool and why, a legacy system this must stay compatible with.
-->

- [Constraint 1 — e.g. "Must support IE11" or "No new runtime dependencies without discussion"]
- [Constraint 2 — e.g. "All user data must stay in the EU (GDPR)"]
- [Constraint 3]

## Repository layout

<!-- A short map, not a full tree. Point at the 3-6 directories that matter most. -->

| Path | What lives there |
| --- | --- |
| `[src/...]` | [e.g. application source] |
| `[tests/...]` | [e.g. test suite] |
| `[...]` | [...] |

## Links

- Issue tracker: [Plane workspace/project URL]
- Design docs: [link, if any]
- Deployed environments: [staging URL, production URL]
- Runbook / on-call: [link, if any]

## Glossary

<!-- Domain terms an agent (or new hire) would otherwise have to guess at. Delete if none. -->

- **[Term]**: [definition, in this project's specific sense]
