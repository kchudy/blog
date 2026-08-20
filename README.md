# Blog

A self-hosted, static publishing platform for long-form articles — built with
[Vite](https://vite.dev) + [Svelte](https://svelte.dev), deployed to GitHub Pages. No server, no
database, no login: posts are Markdown files in this repo, and publishing one means opening a
pull request.

See [`.ai/project.md`](.ai/project.md) for what this project is and why, and
[`.ai/architecture.md`](.ai/architecture.md) /
[`.ai/decisions/`](.ai/decisions/) for how it's built and why it's built that way.

## Writing a post

Add a Markdown file under `content/posts/`:

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

`status: draft` (or a future `published_at`) keeps a post out of the built site until you flip it
to `published` — see [`content/posts/welcome-to-the-new-blog.md`](content/posts/welcome-to-the-new-blog.md)
for the full writeup of this workflow, and
[`content/posts/formatting-a-post.md`](content/posts/formatting-a-post.md) for a Markdown feature
reference. `slug` must be unique across every post; the build fails loudly if two collide.

## Local development

Requires Node 20+.

```sh
npm install
npm run dev      # dev server at http://localhost:5173, rebuilds content on every edit
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## Checks

```sh
npm run lint          # ESLint
npm run format:check  # Prettier
npm test              # Vitest
```

`npm run format` applies Prettier's fixes in place.

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which
builds the site and deploys it to GitHub Pages via `actions/deploy-pages` — no secrets or manual
steps required. [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs lint/format/test/build
on every push and pull request.
