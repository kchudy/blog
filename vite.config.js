import path from "node:path";
import { fileURLToPath } from "node:url";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

import { buildContent } from "./scripts/build-content.js";
import { BASE_PATH } from "./site.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "content", "posts");

/**
 * Regenerates src/generated/posts.json and public/feed.xml from content/posts/*.md before every
 * build (`buildStart` runs in both `vite` and `vite build`), and again on every content edit
 * while `vite dev` is running — full-reloading the page so edits are visible without restarting
 * the dev server. See scripts/build-content.js.
 */
function contentPlugin() {
  return {
    name: "blog-content",
    buildStart() {
      buildContent();
    },
    configureServer(server) {
      server.watcher.add(CONTENT_DIR);
      server.watcher.on("all", (_event, file) => {
        if (path.resolve(file).startsWith(CONTENT_DIR)) {
          buildContent();
          server.ws.send({ type: "full-reload" });
        }
      });
    },
  };
}

export default defineConfig({
  // This repo is served as a GitHub Pages *project* site (kchudy.github.io/blog/), not at the
  // domain root — keep in sync with site.config.js's BASE_PATH.
  base: BASE_PATH,
  plugins: [contentPlugin(), svelte()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
  },
  // Without this, Vite resolves Svelte's server (SSR) build under Vitest instead of the
  // client/DOM build that @testing-library/svelte's `mount()` needs — "`mount(...)` is not
  // available on the server" otherwise. Scoped to `process.env.VITEST` so `vite build`/`vite dev`
  // are unaffected.
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
});
