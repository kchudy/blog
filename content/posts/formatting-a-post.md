---
title: Formatting a Post
slug: formatting-a-post
author: Kamil Chudy
tags: [meta]
status: published
published_at: 2026-08-15
---

A short reference for what's available in a post body — plain [CommonMark](https://commonmark.org/)
plus tables, rendered and sanitized at build time (see `scripts/build-content.js`).

## Text

Regular paragraphs, **bold**, _italic_, and [links](https://svelte.dev) all work as you'd expect.

## Lists

- Bullet points
- Like this one
  1. Numbered sub-items
  2. Also work

## Code

Inline code like `const x = 1` sits in a sentence, or as a fenced block:

```js
export function greet(name) {
  return `Hello, ${name}!`;
}
```

## Tables

| Tag         | Meaning                         |
| ----------- | ------------------------------- |
| `draft`     | Not built into the site yet     |
| `published` | Live once `published_at` passes |

## Quotes

> A blockquote, for pulling out a line worth setting apart from the rest of the text.
