# Coding Style

<!--
  This is the standard the implementation agent is told to follow and the review agent is told
  to hold changes to. Vague guidance here ("write clean code") produces vague reviews — be as
  specific as your team's actual `.eslintrc`/`ruff.toml`/style guide allows, and prefer linking
  to the enforced config over restating it by hand where one exists.
-->

## Languages & formatting

- **Formatter:** Prettier (`prettier --write .`), config in `.prettierrc.json` (with
  `prettier-plugin-svelte` for `.svelte` files) — run automatically via CI; do not hand-format.
- **Linter:** ESLint (`eslint .`), flat config in `eslint.config.js` — `@eslint/js` recommended +
  `eslint-plugin-svelte` recommended, with `eslint-config-prettier` disabling any stylistic rule
  that would conflict with Prettier. CI fails the build on lint errors; treat warnings the same
  way unless a rule is disabled inline with a comment explaining why (e.g. the
  `svelte/no-at-html-tags` suppression in `PostDetailPage.svelte`, where the HTML being rendered
  is already sanitized upstream).
- **Type checking:** not enforced via TypeScript/JSDoc-checking at this project's size — plain
  JavaScript throughout. Revisit if the codebase grows enough that untyped code becomes a real
  source of bugs.

## Naming conventions

- Files/modules: `camelCase.js` for plain modules, `PascalCase.svelte` for components
- Reactive (rune-using) plain modules: `name.svelte.js` — required by Svelte for `$state`/
  `$derived`/etc. to work outside a `.svelte` file (see `src/lib/router.svelte.js`,
  `src/lib/storage.svelte.js`)
- Variables/functions: `camelCase`
- Components (classes in the Svelte sense): `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Content files: `content/posts/<slug>.md` — filename doesn't have to match `slug` in
  frontmatter, but keeping them the same makes a post easy to find

## Structure & patterns

- Keep components thin: filtering/searching/pagination logic that's reused belongs in
  `src/lib/posts.js` as a plain, testable function taking data as an argument — not copy-pasted
  across components. See that file's functions (`search`, `filterByTag`, `paginate`,
  `findBySlug`) for the pattern: pure functions over a `posts` array, not implicit access to the
  generated data, specifically so tests can pass in fixtures.
- `scripts/build-content.js` is the only place Markdown gets rendered/sanitized and the only
  place "published" gets decided — don't duplicate either of those checks client-side.
- `localStorage` (`src/lib/storage.svelte.js`) is for per-browser state only — never for anything
  a post's author or another reader needs to see. If a feature needs that, it needs
  `content/posts/` (build-time content) instead, not browser storage. See
  `.ai/decisions/ADR-0004-rewrite-as-static-vite-svelte-site.md`.
- New dependencies need a one-line note in the PR description explaining why the platform/stdlib
  couldn't already do it.

## Testing expectations

- **Framework:** Vitest, with `@testing-library/svelte` for component tests (jsdom environment).
- **Coverage expectation:** every exported function in `src/lib/posts.js` and every behavior of
  `scripts/build-content.js` (published/draft/future filtering, sanitization, duplicate-slug/
  missing-field validation) needs at least one test; components get a smoke test (renders the
  expected content/heading, shows the right empty-state message) rather than exhaustive
  interaction tests.
- **What must pass before a change is considered done:** `npm run lint && npm run format:check &&
npm test && npm run build` all green — see `.ai/workflow.yaml`'s `commands` for the exact
  invocations the orchestrator runs automatically after implementation.
- Component tests mock `../posts.js`/`../storage.svelte.js` with small fixture objects rather
  than depending on `src/generated/posts.json` — see `PostListPage.test.js`/
  `PostDetailPage.test.js` for the pattern. `scripts/build-content.test.js` instead writes real
  temporary `.md` fixture files and calls `buildContent()` with overridden directories, since
  that script's whole job _is_ reading files from disk.
- `vitest.setup.js` registers `@testing-library/svelte`'s `cleanup()` in a global `afterEach` —
  needed because this project doesn't set `test.globals: true` (see that file's comment), so
  don't remove it or component tests will leak DOM state between `it()` blocks in the same file.

## Commit / branch conventions

<!-- The orchestrator's own branch naming (feature/<issue-id>-<slug>) is fixed by app/git_service.py
     — this section is about commit message and PR conventions on top of that. See also
     knowledge/conventions.md for a living log of examples. -->

- Commit messages: `<issue-id>: summary in imperative mood` (see `.ai/knowledge/conventions.md`
  for examples)
- PR titles: `[ISSUE-ID] Summary`
- Branches: `feature/<issue-id>-<slug>`, created automatically by the orchestrator

## Review standards

- No PR merges with a failing CI check (lint, format, test, or build), no exceptions.
- A component or function with non-obvious intent gets a short comment — not just a restatement
  of its name.
- Error handling: `localStorage` access is wrapped defensively (see `storage.svelte.js`'s
  `safeGet`/`safeSet`) since it can throw (private browsing, quota, disabled storage) — a feature
  built on it should degrade silently, not crash the page. Elsewhere, never swallow an exception
  silently; let it propagate or log it with context.
- Security: never `{@html}` content that hasn't been through `sanitize-html` first — post bodies
  are sanitized once, at build time, in `scripts/build-content.js`; don't add a second
  `{@html}` call elsewhere that bypasses it.
