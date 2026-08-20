<script>
  import { readTracker } from "../storage.svelte.js";

  let { post, showExcerpt = false } = $props();

  let publishedDate = $derived(
    new Date(post.publishedAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );
</script>

<article class="post-summary">
  <h2>
    <a href="#/posts/{post.slug}">{post.title}</a>
    {#if readTracker.isRead(post.slug)}
      <span class="read-badge" title="You've read this">✓</span>
    {/if}
  </h2>
  <p class="post-meta">
    By {post.author} &middot; {publishedDate}
    {#if post.tags.length > 0}
      &middot;
      {#each post.tags as tag, i (tag)}
        <a href="#/?tag={encodeURIComponent(tag)}">{tag}</a>{i <
        post.tags.length - 1
          ? ","
          : ""}
      {/each}
    {/if}
  </p>
  {#if showExcerpt}
    <p class="post-excerpt">{post.excerpt}</p>
  {/if}
</article>
