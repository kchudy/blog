import { cleanup } from "@testing-library/svelte";
import { afterEach } from "vitest";

import "@testing-library/jest-dom/vitest";

// @testing-library/svelte's own auto-cleanup only registers itself against a *global* afterEach
// (which only exists with test.globals: true, which this project deliberately doesn't set — see
// eslint.config.js/vite.config.js for why explicit imports are preferred). Without this, each
// render() in a test file piles onto the previous one's leftover DOM instead of starting fresh.
afterEach(() => {
  cleanup();
});
