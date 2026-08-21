<script>
  import Tag from "./Tag.svelte";

  let { post, index, activeTag } = $props();

  // Row numbering follows the current sort order, not a stable post id — see PostListPage.
  let indexLabel = $derived(String(index).padStart(3, "0"));
  let dateLabel = $derived(post.publishedAt.slice(0, 10));
</script>

<article class="post-row">
  <span class="post-row-index">{indexLabel}</span>
  <div class="post-row-main">
    <a href="#/posts/{post.slug}" class="post-row-title">{post.title}</a>
    <div class="post-row-meta">
      <span class="post-row-author">{post.author}</span>
      <span class="meta-divider"></span>
      <span class="post-row-date">{dateLabel}</span>
      {#if post.tags.length > 0}
        <span class="meta-divider"></span>
        {#each post.tags as tag (tag)}
          <a href="#/?tag={encodeURIComponent(tag)}" class="tag-link">
            <Tag tone={tag === activeTag ? "brand" : "neutral"}>{tag}</Tag>
          </a>
        {/each}
      {/if}
    </div>
  </div>
  <span class="post-row-affordance">Read</span>
</article>

<style>
  .post-row {
    display: grid;
    grid-template-columns: 52px 1fr auto;
    gap: 16px;
    align-items: start;
    padding: 20px 12px 20px 0;
    border-bottom: 1px solid var(--hair);
    transition: background var(--dur-fast) var(--ease);
  }

  .post-row:hover {
    background: var(--hover);
  }

  .post-row-index {
    padding-top: 5px;
    padding-left: 2px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--faint);
  }

  .post-row-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .post-row-title {
    font-size: 21px;
    line-height: 1.2;
    font-weight: 600;
    letter-spacing: -0.015em;
    color: var(--ink);
    text-decoration: none;
    text-wrap: pretty;
  }

  .post-row-title:hover {
    color: var(--brand);
  }

  .post-row-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .post-row-author {
    font-size: 12.5px;
    color: var(--muted);
  }

  .meta-divider {
    width: 1px;
    height: 11px;
    background: var(--hair2);
  }

  .post-row-date {
    font-family: var(--font-mono);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }

  .tag-link {
    text-decoration: none;
  }

  .post-row-affordance {
    padding-top: 7px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--faint);
  }
</style>
