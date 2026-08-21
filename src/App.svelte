<script>
  import PostDetailPage from "./lib/components/PostDetailPage.svelte";
  import PostListPage from "./lib/components/PostListPage.svelte";
  import NotFound from "./lib/components/NotFound.svelte";
  import Button from "./lib/components/Button.svelte";
  import { allPosts } from "./lib/posts.js";
  import { matchRoute, router } from "./lib/router.svelte.js";
  import { theme } from "./lib/storage.svelte.js";

  let route = $derived(matchRoute(router.path));
  let postCount = $derived(String(allPosts.length).padStart(2, "0"));

  $effect(() => {
    document.documentElement.dataset.theme = theme.current;
  });
</script>

<header class="site-header">
  <span class="mark" aria-hidden="true"></span>
  <a href="#/" class="wordmark">infra/notes</a>
  <span class="header-divider"></span>
  <span class="tagline">Engineering blog</span>
  <span class="header-spacer"></span>
  <span class="post-count">{postCount} posts</span>
  <span class="header-divider"></span>
  <Button onclick={() => theme.toggle()} aria-label="Toggle color theme">
    {theme.current === "dark" ? "Light" : "Dark"}
  </Button>
</header>
<div class="accent-bar"></div>

<main class:prose={route.name !== "list"}>
  {#if route.name === "list"}
    <PostListPage params={router.params} />
  {:else if route.name === "detail"}
    <PostDetailPage slug={route.slug} />
  {:else}
    <NotFound />
  {/if}
</main>

<style>
  .site-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 14px;
    height: 53px;
    padding: 0 28px;
    background: var(--paper);
    border-bottom: 1px solid var(--hair);
  }

  .mark {
    flex-shrink: 0;
    width: 15px;
    height: 15px;
    background: var(--brand);
  }

  .wordmark {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--ink);
    text-decoration: none;
  }

  .header-divider {
    width: 1px;
    height: 20px;
    background: var(--hair2);
  }

  .tagline {
    font-size: 12.5px;
    color: var(--muted);
  }

  .header-spacer {
    flex: 1;
  }

  .post-count {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--faint);
  }

  .accent-bar {
    flex-shrink: 0;
    height: 3px;
    background: var(--brand);
  }

  main {
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: 28px 28px 96px;
    box-sizing: border-box;
  }

  /* The post detail/not-found pages aren't redesigned yet (see .ai/decisions and the BLOG-2
     handoff, scoped to the post index only) — keep them in the narrow reading column the whole
     site used before this redesign, instead of the index page's 1180px grid. */
  main.prose {
    max-width: 40rem;
    padding: 1rem;
  }
</style>
