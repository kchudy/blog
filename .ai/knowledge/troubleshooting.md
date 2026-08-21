# Troubleshooting

This is a running log of recurring **operational** problems — things that go wrong when
running, building, deploying, or developing this project locally — and how to resolve them.
It's aimed at "I hit this error, now what" lookups, distinct from `known-issues.md` (accepted
product/code bugs) and `.ai/architecture.md` (how the system is designed to work). Keep entries
symptom-first so they're easy to find by grepping the error text.

Add an entry whenever the same operational problem has bitten more than one person (or the same
person twice) — that's the signal it belongs here rather than living only in someone's memory
or a chat log.

## Entry format

```
### [Symptom, ideally including the literal error text]

- **Cause:** [why this happens]
- **Fix:** [the concrete steps to resolve it]
- **Notes:** [anything else worth knowing — how to avoid it, when it tends to happen]
```

## Example entry

### `npm ci` fails with `EUSAGE — npm ci can only install packages when your package.json and package-lock.json are in sync`

- **Cause:** `package.json` was edited (a dependency added/bumped) without regenerating
  `package-lock.json` via `npm install` before committing.
- **Fix:** Run `npm install` locally (not `npm ci`) to regenerate the lockfile, then commit
  the updated `package-lock.json` alongside the `package.json` change.
- **Notes:** This is why CI and the orchestrator's `install` command use `npm ci` rather than
  `npm install` — it fails loudly on a stale lockfile instead of silently installing something
  slightly different from what's committed. If you see this from the `@implementation` agent's
  feedback loop, it means its own change touched `package.json` without updating the lockfile.

### `npm run lint` fails with dozens of `'React' is not defined` / `Empty block statement` errors under `.ai/attachments/...`

- **Cause:** `.ai/attachments/<ISSUE>/<uuid>/...` holds design-handoff reference files (extracted
  from an uploaded zip, e.g. a `_ds_bundle.js` React component bundle and a minified `support.js`
  prototype runtime) that are gitignored (see `.ai/attachments/.gitignore`) but still present on
  disk during a task run, and `eslint .`/`prettier --check .` scan the whole working directory by
  default. Neither ESLint's `ignores` (`eslint.config.js`) nor `.prettierignore` excluded
  `.ai/attachments/` before this was hit, so these vendored, non-project-convention files got
  linted/formatted like app source.
- **Fix:** `.ai/attachments/` is now in both `eslint.config.js`'s `ignores` array and
  `.prettierignore`. If a future attachment path somehow still gets picked up (e.g. a differently
  named folder under `.ai/`), broaden the ignore pattern rather than editing the vendored files.
- **Notes:** These files are reference-only (a design handoff to read, not code to run through
  this repo's lint/format rules) — never "fix" the errors inside them.

<!-- Add real entries below this line as they're found. -->
