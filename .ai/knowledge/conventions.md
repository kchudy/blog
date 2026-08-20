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

```
<issue-id>: <short summary in imperative mood>

<optional longer body explaining why, not just what>

Co-Authored-By: AI Orchestrator <ai-orchestrator@localhost>
```

e.g.:

```
DG-12: Add RSS feed for published posts

Serves the 20 most recent published posts at /feed/ via Django's syndication
framework (blog.feeds.LatestPostsFeed) — no custom feed-rendering code needed.

Co-Authored-By: AI Orchestrator <ai-orchestrator@localhost>
```

The `Co-Authored-By` trailer is added automatically to commits made by the `@implementation`
agent — leave it in place when amending or squashing such a commit, it's how the team can tell
which changes were AI-assisted after the fact.

<!-- Add real, project-specific entries below this line as they're noticed. This project is
     greenfield — there's no implementation history yet to draw conventions from beyond the
     two above, which come from .ai/coding-style.md's "Commit / branch conventions" section.
     The first agent/human to notice a consistent, undocumented pattern in actual code (e.g. a
     recurring way tests are structured, a naming quirk for template partials) should add it
     here rather than leaving it to be rediscovered. -->

## The GitHub Pages base path lives in exactly one file

`site.config.js`'s `BASE_PATH`/`SITE_URL` are imported by both `vite.config.js` (so built asset
URLs resolve under `/blog/`) and `scripts/build-content.js` (so RSS `<link>`/`<guid>` URLs are
correct absolute links). Update the path in `site.config.js` only — duplicating it into either
consumer directly is exactly the kind of drift that quietly breaks either asset loading or the
feed depending on which copy goes stale. See
`.ai/decisions/ADR-0004-rewrite-as-static-vite-svelte-site.md`.

## Content and app code are tested with different strategies, deliberately

`scripts/build-content.test.js` writes real temporary `.md` files to disk and calls
`buildContent()` with directory overrides, because that script's entire job is reading files —
faking that away would test nothing real. Component tests
(`PostListPage.test.js`/`PostDetailPage.test.js`) do the opposite: they mock `../posts.js` (and
`../storage.svelte.js` where relevant) with small inline fixture objects rather than depending on
`src/generated/posts.json` existing on disk. Don't "fix" one to look like the other — match the
strategy to what's actually being tested, per `.ai/coding-style.md`'s testing section.
