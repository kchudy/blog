// The localStorage-backed state this app actually keeps: theme preference and which posts a
// reader has already read. Deliberately NOT where posts live — see
// .ai/decisions/ADR-0004-rewrite-as-static-vite-svelte-site.md for why post content is static/
// build-time instead: localStorage is private to one browser on one device, so it can't be where
// something meant for every reader lives.
//
// Every read/write is wrapped in try/catch: localStorage can throw (Safari private browsing,
// storage disabled by policy, quota exceeded), and no feature here is essential enough to justify
// crashing the page over it — it just silently won't remember, rather than erroring.

import { SvelteSet } from "svelte/reactivity";

const THEME_KEY = "blog:theme";
const READ_POSTS_KEY = "blog:read-posts";

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Unavailable or full — nothing to do; the app keeps working without persistence.
  }
}

function prefersDark() {
  return (
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-color-scheme: dark)").matches
  );
}

class ThemeStore {
  current = $state(safeGet(THEME_KEY) ?? (prefersDark() ? "dark" : "light"));

  toggle() {
    this.current = this.current === "dark" ? "light" : "dark";
    safeSet(THEME_KEY, this.current);
  }
}

export const theme = new ThemeStore();

function readSlugSet() {
  try {
    return new SvelteSet(JSON.parse(safeGet(READ_POSTS_KEY) ?? "[]"));
  } catch {
    return new SvelteSet();
  }
}

class ReadTracker {
  #slugs = $state(readSlugSet());

  isRead(slug) {
    return this.#slugs.has(slug);
  }

  markRead(slug) {
    if (this.#slugs.has(slug)) return;
    const next = new SvelteSet(this.#slugs);
    next.add(slug);
    this.#slugs = next;
    safeSet(READ_POSTS_KEY, JSON.stringify([...next]));
  }
}

export const readTracker = new ReadTracker();
