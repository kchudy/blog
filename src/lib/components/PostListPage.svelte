<script>
  import {
    allPosts,
    archiveBuckets,
    filterByTag,
    search,
    siteMeta,
    sortByKey,
    tagCounts,
  } from "../posts.js";
  import { navigate } from "../router.svelte.js";
  import Button from "./Button.svelte";
  import PostRow from "./PostRow.svelte";
  import SearchBox from "./SearchBox.svelte";
  import SortToggle from "./SortToggle.svelte";
  import TagRail from "./TagRail.svelte";

  let { params } = $props();

  // Free-text search stays local — the design has no submit button and no need to be shareable.
  let query = $state("");
  let sortKey = $state("date");
  let sortDir = $state("desc");

  // The tag filter lives in the URL, not local state, so links elsewhere in the app (e.g. a tag
  // on the post detail page, "#/?tag=<tag>") land here already filtered.
  let tag = $derived(params.get("tag") ?? "all");

  let filtered = $derived.by(() => {
    const byQuery = search(allPosts, query);
    return tag === "all" ? byQuery : filterByTag(byQuery, tag);
  });
  let sorted = $derived(sortByKey(filtered, sortKey, sortDir));

  let tags = $derived(tagCounts(allPosts));
  let archive = $derived(archiveBuckets(allPosts));
  let authorCount = $derived(new Set(allPosts.map((p) => p.author)).size);

  let hasFilter = $derived(query.trim() !== "" || tag !== "all");
  let filterLabel = $derived(
    tag !== "all" ? `clear #${tag}` : `clear "${query.trim()}"`,
  );

  function selectSort(key) {
    if (sortKey === key) {
      sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDir = key === "date" ? "desc" : "asc";
    }
  }

  function clearFilters() {
    query = "";
    navigate("/");
  }
</script>

<svelte:head>
  <title>Posts · Blog</title>
</svelte:head>

<div class="index-grid">
  <TagRail {tags} totalCount={allPosts.length} {archive} activeTag={tag} />

  <div class="index-main">
    <p class="kicker">Index</p>
    <h1>Posts</h1>
    <p class="deck">
      Field notes from the infrastructure and security team — deployments,
      packet captures, and the write-ups we wish we had found first.
    </p>

    <div class="controls">
      <SearchBox bind:value={query} />
      <div class="sort-group">
        <span class="sort-label">Sort</span>
        <SortToggle {sortKey} {sortDir} onSelect={selectSort} />
      </div>
    </div>

    <div class="result-meta">
      <span class="showing">showing {sorted.length} / {allPosts.length}</span>
      {#if hasFilter}
        <button type="button" class="clear-link" onclick={clearFilters}>
          <span>{filterLabel}</span>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      {/if}
    </div>

    <div class="post-list">
      {#each sorted as post, i (post.slug)}
        <PostRow {post} index={i + 1} activeTag={tag} />
      {/each}
    </div>

    {#if sorted.length === 0}
      <div class="empty-state">
        <p class="empty-title">No matches</p>
        <p class="empty-body">
          Nothing in the index matches that filter. Two posts so far — the
          archive is young.
        </p>
        <Button onclick={clearFilters}>Clear filters</Button>
      </div>
    {/if}

    <div class="footer-strip">
      <span
        >{allPosts.length} entries · {tags.length} tags · {authorCount} author{authorCount ===
        1
          ? ""
          : "s"}</span
      >
      <span class="rule"></span>
      <span>index built {siteMeta.builtAt} · v{siteMeta.version}</span>
    </div>
  </div>
</div>

<style>
  .index-grid {
    display: grid;
    grid-template-columns: 216px 1fr;
    gap: 32px;
    align-items: start;
  }

  .index-main {
    min-width: 0;
  }

  .kicker {
    margin: 0 0 9px;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--brand);
  }

  h1 {
    margin: 0 0 10px;
    font-size: 40px;
    line-height: 1.05;
    font-weight: 700;
    letter-spacing: -0.025em;
  }

  .deck {
    margin: 0 0 24px;
    max-width: 62ch;
    font-size: 14px;
    line-height: 1.55;
    color: var(--muted);
    text-wrap: pretty;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .sort-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sort-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .result-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 9px;
  }

  .showing {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-variant-numeric: tabular-nums;
    color: var(--faint);
  }

  .clear-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    border: none;
    background: none;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--brand);
    cursor: pointer;
  }

  .post-list {
    border-top: 1px solid var(--ink);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 56px 0 44px;
    border-bottom: 1px solid var(--hair);
  }

  .empty-title {
    margin: 0;
    font-size: 40px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--hair2);
  }

  .empty-body {
    margin: 0;
    max-width: 46ch;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--muted);
  }

  .footer-strip {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 16px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.03em;
    font-variant-numeric: tabular-nums;
    color: var(--faint);
  }

  .footer-strip .rule {
    flex: 1;
    min-width: 20px;
    height: 1px;
    background: var(--hair);
  }

  @media (max-width: 900px) {
    .index-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
