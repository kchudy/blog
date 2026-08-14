# Coding Style

<!--
  This is the standard the implementation agent is told to follow and the review agent is told
  to hold changes to. Vague guidance here ("write clean code") produces vague reviews — be as
  specific as your team's actual `.eslintrc`/`ruff.toml`/style guide allows, and prefer linking
  to the enforced config over restating it by hand where one exists.
-->

## Languages & formatting

- **Formatter:** Ruff (`ruff format`), config in `pyproject.toml` — run automatically via
  pre-commit and CI; do not hand-format.
- **Linter:** Ruff (`ruff check`) with rules `E, F, I, UP, B, DJ` (the `DJ` set catches
  Django-specific issues, e.g. a missing `related_name`, raw SQL). CI fails the build on lint
  errors; treat warnings the same way unless a rule is disabled inline with a comment explaining
  why.
- **Type checking:** not enforced via mypy at this project's size — type hints are encouraged on
  new functions/methods but not required. Revisit (add `django-stubs` + mypy to CI) if the
  codebase grows enough that untyped code becomes a real source of bugs.

## Naming conventions

- Files/modules: `snake_case.py`
- Variables/functions: `snake_case`
- Classes (models, forms, class-based views): `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Templates: `snake_case.html`, namespaced one directory per app —
  `blog/templates/blog/post_detail.html`, not a flat shared directory
- Migrations: keep Django's auto-generated names for schema-only changes; give a hand-edited or
  data migration an explicit descriptive name (e.g. `0007_backfill_post_slugs.py`)

## Structure & patterns

- Keep views thin: query/validation logic that's reused belongs on the model or a custom
  manager (e.g. `Post.objects.published()`), not copy-pasted across views.
- One app (`blog/`) for now — don't split into more apps until a second genuinely distinct
  domain (e.g. a separate `newsletter` concern) shows up; a blog this size doesn't need an app
  per model.
- Validation belongs in a `forms.Form`/`forms.ModelForm`, not ad-hoc checks scattered in a view.
- Settings live in a single `config/settings.py` reading configuration from environment
  variables (12-factor style) — no `settings/base.py` + `dev.py` + `prod.py` split; that's more
  indirection than a single-environment-per-deploy project needs.
- New dependencies need a one-line note in the PR description explaining why Django or the
  stdlib couldn't already do it.

## Testing expectations

- **Framework:** pytest + `pytest-django`
- **Coverage expectation:** every model method/manager and every view needs at least one test;
  form validation edge cases (e.g. a duplicate slug) need explicit tests; templates get a smoke
  test (status code + key expected content) rather than exhaustive HTML assertions.
- **What must pass before a change is considered done:** `uv run ruff check . && uv run ruff
  format --check . && uv run pytest` all green — see `.ai/workflow.yaml`'s `commands` for the
  exact invocations the orchestrator runs automatically after implementation.
- Prefer hitting real URLs through `pytest-django`'s `client` fixture over mocking view
  internals; build test data with plain model instances/pytest fixtures rather than fixture JSON
  files.

## Commit / branch conventions

<!-- The orchestrator's own branch naming (feature/<issue-id>-<slug>) is fixed by app/git_service.py
     — this section is about commit message and PR conventions on top of that. See also
     knowledge/conventions.md for a living log of examples. -->

- Commit messages: `<issue-id>: summary in imperative mood` (see `.ai/knowledge/conventions.md`
  for examples)
- PR titles: `[ISSUE-ID] Summary`
- Branches: `feature/<issue-id>-<slug>`, created automatically by the orchestrator

## Review standards

- No PR merges with a failing CI check (lint or test), no exceptions.
- A view, model method, or form with non-obvious intent gets a short docstring — not just a
  restatement of its signature.
- Error handling: never swallow an exception silently; let it propagate or log it with context.
  `DEBUG=False` in every deployed environment — no stack traces shown to visitors.
- Security: never log secrets, `SECRET_KEY`, or DB credentials; keep Django's CSRF protection on
  for every POST form; never `mark_safe`/`|safe` user-influenced content — post bodies go
  through a Markdown-to-HTML step that must sanitize its output.
