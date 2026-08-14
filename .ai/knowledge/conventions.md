# Conventions

This is a running log of conventions actually followed in this project — the small, unwritten
rules a new contributor (human or AI agent) would otherwise only learn by having a PR sent back
for not following them. `.ai/coding-style.md` covers formatting/naming/testing standards this
project holds itself to as policy; this file is for the more specific, example-grounded "this is
how we actually do X here" notes that accumulate over time, including ones that emerge from
implementation work rather than being decided upfront.

Add an entry whenever an agent or human notices a pattern being followed consistently that isn't
already written down anywhere. Prefer a concrete example over an abstract rule.

## Entry format

```
### [Convention name]

[What the convention is, with a real or realistic example. Note where it's enforced, if
anywhere (a lint rule, a CI check, a template) — an unenforced convention is worth knowing is
unenforced.]
```

## Branch naming

The orchestrator creates task branches automatically for the `@implementation` agent, named:

```
feature/<issue-id>-<slug>
```

e.g. `feature/DG-42-add-dark-mode` for issue `DG-42` titled "Add dark mode". This is fixed by
`app/git_service.py`'s `branch_name()` on the orchestrator side, not configurable per-project —
if you create branches manually (not via the orchestrator), matching this pattern keeps things
consistent and makes it obvious at a glance which branches were AI-assisted vs. hand-created
under a different scheme.

## Commit message format

<!-- Example — replace with what this project actually does. -->

```
<issue-id>: <short summary in imperative mood>

<optional longer body explaining why, not just what>

Co-Authored-By: AI Orchestrator <ai-orchestrator@localhost>
```

e.g.:

```
DG-42: Add dark mode toggle to settings page

Persists the preference in localStorage and respects prefers-color-scheme
on first load when no preference has been set yet.

Co-Authored-By: AI Orchestrator <ai-orchestrator@localhost>
```

The `Co-Authored-By` trailer is added automatically to commits made by the `@implementation`
agent — leave it in place when amending or squashing such a commit, it's how the team can tell
which changes were AI-assisted after the fact.

<!-- Add real, project-specific entries below this line as they're noticed. -->
