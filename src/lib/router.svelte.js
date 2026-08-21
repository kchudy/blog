// Minimal hash-based router. Hash fragments never reach the server, so GitHub Pages (which has
// no way to rewrite arbitrary paths to index.html) needs no fallback-page trick for this to work
// — see .ai/decisions/ADR-0004-rewrite-as-static-vite-svelte-site.md.
import { SvelteURLSearchParams } from "svelte/reactivity";

function parseHash(hash) {
  const clean = hash.replace(/^#/, "") || "/";
  const [routePath, queryString] = clean.split("?");
  return {
    path: routePath || "/",
    params: new SvelteURLSearchParams(queryString ?? ""),
  };
}

function currentHash() {
  return typeof window === "undefined" ? "" : window.location.hash;
}

class Router {
  #route = $state(parseHash(currentHash()));

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("hashchange", () => {
        this.#route = parseHash(currentHash());
      });
    }
  }

  get path() {
    return this.#route.path;
  }

  get params() {
    return this.#route.params;
  }
}

export const router = new Router();

/** Navigate to `path` (e.g. "/posts/my-slug"), optionally with query params. */
export function navigate(routePath, params) {
  const query = params
    ? `?${new SvelteURLSearchParams(params).toString()}`
    : "";
  window.location.hash = `${routePath}${query}`;
}

/** Routes this app understands: the post list (optionally filtered) and a single post's detail. */
export function matchRoute(routePath) {
  if (routePath === "/" || routePath === "") return { name: "list" };
  const postMatch = routePath.match(/^\/posts\/([^/]+)\/?$/);
  if (postMatch)
    return { name: "detail", slug: decodeURIComponent(postMatch[1]) };
  return { name: "not-found" };
}
