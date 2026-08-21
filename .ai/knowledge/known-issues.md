# Known Issues

This is a running log of known bugs, limitations, and rough edges in this project — the things
an engineer (human or AI agent) would otherwise have to rediscover the hard way. It is not a
bug tracker; use Plane for anything that should be actively worked. This file is for issues
that are known, understood, and currently *accepted* (not yet fixed, low priority, or a
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

<!-- Add real entries below this line as they're found. Delete the example above once this
     file has at least one real entry, or leave it as a format reference — either is fine. -->

### Post index's live text filter only searches the current page

- **Where:** `blog/templates/blog/post_list.html`, `static/js/post-index.js`
- **Symptom:** Typing in the "Filter posts, tags, authors…" box on the post index only
  hides/shows rows already rendered on that page — it doesn't search posts on other pages of a
  paginated result.
- **Cause:** By design (BLOG-1 redesign): the box is a client-side-only progressive enhancement
  matching the Defguard design handoff's "live-filter, no submit button" spec, which assumed an
  unpaginated small post list. Tag filtering and sort (`?tag=`/`?sort=`/`?dir=`) are real
  server-side query params that do cover the whole site and work with JS disabled; the real
  full-text search at `/search/` also searches every published post's title/body server-side.
- **Impact:** Low today (the blog has two posts, well under `PostListView.paginate_by = 10`).
  Once post count regularly exceeds one page, the quick filter will feel incomplete for readers
  who don't realize `/search/` exists for site-wide search.
- **Workaround:** Use the header's "Search" link for a query that should cover every post, not
  just the current page.
- **Tracked:** not yet filed
