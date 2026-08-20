import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import globals from "globals";

export default [
  {
    // Flat config's `ignores`-only object is the one place a glob applies globally rather than
    // just to the files matched by that same config object's own `files` — everything else in
    // this array only scopes rules, so stray non-project directories need to be excluded here.
    ignores: ["dist/", "node_modules/", "src/generated/", ".venv/", "public/"],
  },
  js.configs.recommended,
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021 },
    },
    rules: {
      // Convention for "destructured to discard" (e.g. dropping a field before serializing).
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: [
      "scripts/**/*.js",
      "vite.config.js",
      "site.config.js",
      "vitest.setup.js",
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ["**/*.test.js"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
];
