<script>
  import PostDetailPage from "./lib/components/PostDetailPage.svelte";
  import PostListPage from "./lib/components/PostListPage.svelte";
  import NotFound from "./lib/components/NotFound.svelte";
  import { matchRoute, router } from "./lib/router.svelte.js";
  import { theme } from "./lib/storage.svelte.js";

  let route = $derived(matchRoute(router.path));

  $effect(() => {
    document.documentElement.dataset.theme = theme.current;
  });
</script>

<header>
  <a href="#/" class="brand">Blog</a>
  <button
    class="theme-toggle"
    onclick={() => theme.toggle()}
    aria-label="Toggle color theme"
  >
    {theme.current === "dark" ? "☀️" : "🌙"}
  </button>
</header>

<main>
  {#if route.name === "list"}
    <PostListPage params={router.params} />
  {:else if route.name === "detail"}
    <PostDetailPage slug={route.slug} />
  {:else}
    <NotFound />
  {/if}
</main>
