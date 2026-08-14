# Coding Style

<!--
  This is the standard the implementation agent is told to follow and the review agent is told
  to hold changes to. Vague guidance here ("write clean code") produces vague reviews — be as
  specific as your team's actual `.eslintrc`/`ruff.toml`/style guide allows, and prefer linking
  to the enforced config over restating it by hand where one exists.
-->

## Languages & formatting

- **Formatter:** [e.g. Prettier, config at `.prettierrc`] — run automatically, do not hand-format.
- **Linter:** [e.g. ESLint with `[config]`, or Ruff with rules `[E, F, I, UP, B]`] — CI fails the
  build on lint errors; treat warnings the same way unless a rule is explicitly disabled inline
  with a comment explaining why.
- **Type checking:** [e.g. TypeScript `strict: true`, or mypy/pyright in `[mode]`] — no `any`/
  `# type: ignore` without a comment explaining why it's unavoidable here.

## Naming conventions

- Files: [e.g. `kebab-case.ts` for modules, `PascalCase.tsx` for React components]
- Variables/functions: [e.g. `camelCase`]
- Types/classes: [e.g. `PascalCase`]
- Constants: [e.g. `UPPER_SNAKE_CASE` for module-level constants]
- [Anything project-specific — e.g. "test files are named `*.spec.ts`, not `*.test.ts`"]

## Structure & patterns

- [e.g. "Prefer plain functions over classes unless there's shared state to encapsulate."]
- [e.g. "No business logic in route handlers — delegate to a `services/` module."]
- [e.g. "New dependencies require a short note in the PR description explaining why an
  existing one couldn't be used."]
- [Add the 3-6 patterns that actually come up in review comments on this repo.]

## Testing expectations

- **Framework:** [e.g. Vitest, pytest]
- **Coverage expectation:** [e.g. "every new function in `services/` needs a unit test; UI
  components need at least a render smoke test."]
- **What must pass before a change is considered done:** [e.g. "`npm run lint && npm run build
  && npm test` all green — see `.ai/workflow.yaml`'s `commands` for the exact invocations the
  orchestrator runs automatically after implementation."]
- [e.g. "Prefer testing behavior through the public API over mocking internals."]

## Commit / branch conventions

<!-- The orchestrator's own branch naming (feature/<issue-id>-<slug>) is fixed by app/git_service.py
     — this section is about commit message and PR conventions on top of that. See also
     knowledge/conventions.md for a living log of examples. -->

- Commit messages: [e.g. Conventional Commits — `type(scope): summary`]
- PR titles: [e.g. `[ISSUE-ID] Summary`]
- [Any other convention worth stating explicitly]

## Review standards

<!-- What the review agent should hold every diff to. Be specific enough to ground feedback in. -->

- [e.g. "No PR merges with a failing CI check, no exceptions."]
- [e.g. "Public function/exported symbol needs a docstring/JSDoc explaining intent, not just
  its signature."]
- [e.g. "Error handling: never swallow an exception silently — log or re-raise with context."]
- [e.g. "Security: never log secrets, tokens, or full request bodies containing user data."]
- [Add what this team actually flags in review, so the review agent flags the same things.]
