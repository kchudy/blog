<script>
  import { SvelteURLSearchParams } from "svelte/reactivity";

  import { allPosts, filterByTag, paginate, search } from "../posts.js";
  import { navigate } from "../router.svelte.js";
  import PostSummary from "./PostSummary.svelte";
  import SearchBox from "./SearchBox.svelte";

  let { params } = $props();

  // Three ways to land on this page: plain "/" (all posts), "/?q=..." (search — present even
  // when blank, same as the old dedicated /search/ page), or "/?tag=..." (browse by tag).
  let isSearching = $derived(params.has("q"));
  let query = $derived((params.get("q") ?? "").trim());
  let tag = $derived(params.get("tag") ?? "");
  let page = $derived(Math.max(1, Number(params.get("page")) || 1));

  let heading = $derived(
    isSearching ? "Search" : tag ? `Posts tagged "${tag}"` : "Posts",
  );

  // null (rather than []) specifically means "searching, but the query is blank" — kept distinct
  // from a real zero-result search so the two can show different messaging below.
  let matched = $derived(
    isSearching
      ? query
        ? search(allPosts, query)
        : null
      : tag
        ? filterByTag(allPosts, tag)
        : allPosts,
  );

  let paged = $derived(matched && paginate(matched, page));

  function goToPage(delta) {
    const next = new SvelteURLSearchParams(params);
    next.set("page", String(page + delta));
    navigate("/", Object.fromEntries(next));
  }
</script>

<svelte:head>
  <title>{heading} · Blog</title>
</svelte:head>

<h1>{heading}</h1>

<SearchBox value={isSearching ? query : ""} />

{#if isSearching && !query}
  <p>Enter a search term above to find articles.</p>
{:else if paged && paged.items.length > 0}
  {#each paged.items as post (post.slug)}
    <PostSummary {post} showExcerpt={isSearching || Boolean(tag)} />
  {/each}

  {#if paged.hasPrevious || paged.hasNext}
    <nav class="pagination">
      {#if paged.hasPrevious}
        <button onclick={() => goToPage(-1)}>Previous</button>
      {/if}
      {#if paged.hasNext}
        <button onclick={() => goToPage(1)}>Next</button>
      {/if}
    </nav>
  {/if}
{:else if isSearching}
  <p>
    No articles found for &quot;{query}&quot;.
    <a href="#/">Browse all articles</a>.
  </p>
{:else}
  <p>No posts yet.</p>
{/if}
