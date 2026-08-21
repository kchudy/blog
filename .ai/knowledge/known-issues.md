# Known Issues

This is a running log of known bugs, limitations, and rough edges in this project — the things
an engineer (human or AI agent) would otherwise have to rediscover the hard way. It is not a
bug tracker; use Plane for anything that should be actively worked. This file is for issues
that are known, understood, and currently _accepted_ (not yet fixed, low priority, or a
tradeoff the team has knowingly made) — so nobody wastes time "discovering" them again, and so
`@implementation`/`@review`/`@qa` agents don't mistake a known limitation for a regression they
introduced.

Add an entry whenever an agent or human finds something that fits this description and isn't
already listed. Remove an entry once it's actually fixed (and mention the fix in the removing
commit/PR so it's traceable).

## Entry format

```
### [Short title]

- **Where:** [file/module/area affected]
- **Symptom:** [what a user or developer actually observes]
- **Cause:** [root cause, if known — say "unknown" if it genuinely isn't]
- **Impact:** [who/what is affected, and how badly]
- **Workaround:** [if any, otherwise "none"]
- **Tracked:** [Plane issue id, if one exists — otherwise "not yet filed"]
```

## Example entry

### CSV export truncates fields containing embedded newlines

- **Where:** `reports/export.py`, `export_to_csv()`
- **Symptom:** Rows with a multi-line "notes" field get cut off after the first line when
  opened in Excel (though the underlying CSV data is actually fine — it's an Excel quoting
  quirk with our current writer settings).
- **Cause:** `csv.writer` is used with default `quoting=QUOTE_MINIMAL`; Excel mishandles
  embedded `\n` inside a quoted field in some locales.
- **Impact:** Cosmetic only in Excel; the CSV itself round-trips correctly through any other
  CSV reader (confirmed via `pandas.read_csv`). Low priority.
- **Workaround:** Open the export in a text editor or re-import via a proper CSV parser rather
  than double-clicking to open in Excel.
- **Tracked:** not yet filed

### `PostSummary.svelte` is dead code left over from the BLOG-2 redesign

- **Where:** `src/lib/components/PostSummary.svelte`.
- **Symptom:** The file still exists and still compiles, but nothing imports it —
  `PostListPage.svelte` now renders `PostRow.svelte` instead (per the Defguard design handoff's
  post index redesign).
- **Cause:** The implementation agent that did the redesign had no file-delete-capable tool
  available in its environment for that run, so it could add `PostRow.svelte` but couldn't
  remove the file it replaced.
- **Impact:** None functionally (lint/format/test/build all pass with it present) — just cruft.
- **Workaround:** `git rm src/lib/components/PostSummary.svelte` whenever someone with normal
  shell access next touches this area.
- **Tracked:** not yet filed

### Post index empty-state copy hardcodes "Two posts so far"

- **Where:** `src/lib/components/PostListPage.svelte`'s empty-state message.
- **Symptom:** The empty-state text reads "Nothing in the index matches that filter. Two posts
  so far — the archive is young." verbatim, regardless of how many posts actually exist.
- **Cause:** This is literal, editorially-written copy from the BLOG-2 design handoff, not a
  template — the handoff hardcodes it the same way. Auto-templating a real count in (e.g. "47
  posts so far") would read as a non-sequitur next to "the archive is young", so it wasn't made
  dynamic.
- **Impact:** Low — cosmetic copy drift once the archive grows past a couple of posts. Nobody is
  currently notified to revisit it.
- **Workaround:** none; a human should update this string by hand once post count no longer
  makes "two posts so far" true.
- **Tracked:** not yet filed

### `readTracker.isRead` has no callers after the BLOG-2 redesign

- **Where:** `src/lib/storage.svelte.js`'s `ReadTracker.isRead`.
- **Symptom:** Nothing reads `isRead` anymore — the old post-index checkmark it powered
  (`PostSummary.svelte`'s `read-badge`) was dropped because the Defguard design handoff's post
  index shows only title/author/date/tags ("nothing else — no excerpt, no reading time, no
  status").
- **Cause:** Deliberate design decision, not a bug.
- **Impact:** None — `readTracker.markRead` (called from `PostDetailPage.svelte`) still runs on
  every post view, so the underlying per-browser read-tracking data keeps being collected even
  though no current screen displays it. Fine to wire `isRead` into a future screen, or remove it
  if nothing ever does.
- **Workaround:** none needed.
- **Tracked:** not yet filed

<!-- Add real entries below this line as they're found. Delete the example above once this
     file has at least one real entry, or leave it as a format reference — either is fine. -->
