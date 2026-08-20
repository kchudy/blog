<script>
  import { allPosts, findBySlug } from "../posts.js";
  import { readTracker } from "../storage.svelte.js";
  import NotFound from "./NotFound.svelte";

  let { slug } = $props();

  let post = $derived(findBySlug(allPosts, slug));

  let publishedDate = $derived(
    post
      ? new Date(post.publishedAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "",
  );

  $effect(() => {
    if (post) readTracker.markRead(post.slug);
  });
</script>

<svelte:head>
  <title>{post ? post.title : "Not found"} · Blog</title>
</svelte:head>

{#if post}
  <article>
    <h1>{post.title}</h1>
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
    <!-- bodyHtml is sanitized at build time (scripts/build-content.js, via sanitize-html) —
         never render unsanitized author input here. -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html post.bodyHtml}
  </article>
  <p><a href="#/">&larr; Back to all posts</a></p>
{:else}
  <NotFound />
{/if}
