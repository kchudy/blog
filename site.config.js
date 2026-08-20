// Shared between vite.config.js and scripts/build-content.js so the GitHub Pages project-page
// path (this repo is served at <SITE_URL><BASE_PATH>, not at the domain root) only has to be
// set in one place. See .ai/decisions/ADR-0004-rewrite-as-static-vite-svelte-site.md.
export const SITE_URL = "https://kchudy.github.io";
export const BASE_PATH = "/blog/";
