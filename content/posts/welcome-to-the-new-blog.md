---
title: Welcome to the new Blog
slug: welcome-to-the-new-blog
author: Kamil Chudy
tags: [meta, svelte]
status: published
published_at: 2026-08-20
---

This blog now runs as a static [Vite](https://vite.dev) + [Svelte](https://svelte.dev) site,
deployed to GitHub Pages — no server, no database, no container to run. Here's how writing a
post works now.

## Writing a post

Add a Markdown file under `content/posts/`, with frontmatter at the top:

```markdown
---
title: My Post Title
slug: my-post-title
author: Your Name
tags: [django, svelte]
status: draft
published_at: 2026-09-01
---

The rest of the file is the post body, in Markdown.
```

- `status: draft` keeps a post out of the built site entirely until you flip it to `published`.
- `published_at` in the future works the same way — the post simply won't appear until that date
  (next time the site is built and deployed).
- `slug` must be unique across every post — the build fails loudly if two posts collide.

Open a pull request the same way you would for any other change. Review/merge access to this
repo _is_ the authoring permission now — there's no separate login or admin panel.

## What changed, and why

Posts used to live in a Postgres, then SQLite, database, edited through the Django admin and
served by a Django/gunicorn container on a VPS, then Kubernetes. All of that is gone: post content
now lives as the Markdown files right next to this code, turned into the site you're reading by a
GitHub Actions build. See
[ADR-0004](https://github.com/kchudy/blog/blob/main/.ai/decisions/ADR-0004-rewrite-as-static-vite-svelte-site.md)
for the full reasoning, including why post _content_ couldn't just live in the browser's
`localStorage` — it's used here, but only for things private to your own browser, like your
light/dark theme preference and which posts you've already read.
