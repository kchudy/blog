<script>
  // Tag rows are plain hash links (not click handlers) — router.svelte.js already reacts to
  // hashchange, and this matches how tag links elsewhere in the app work (see PostDetailPage).
  let { tags, totalCount, archive, activeTag } = $props();
</script>

<aside class="tag-rail">
  <section>
    <div class="rail-header">
      <span class="rail-label">Tags</span>
      <span class="rail-rule"></span>
    </div>
    <nav>
      <a href="#/" class="tag-row" class:active={activeTag === "all"}>
        <span class="tag-row-label">All posts</span>
        <span class="tag-row-count">
          {String(totalCount).padStart(2, "0")}
        </span>
      </a>
      {#each tags as t (t.tag)}
        <a
          href="#/?tag={encodeURIComponent(t.tag)}"
          class="tag-row"
          class:active={activeTag === t.tag}
        >
          <span class="tag-row-label">{t.tag}</span>
          <span class="tag-row-count">
            {String(t.count).padStart(2, "0")}
          </span>
        </a>
      {/each}
    </nav>
  </section>

  <section>
    <div class="rail-header">
      <span class="rail-label">Archive</span>
      <span class="rail-rule"></span>
    </div>
    {#each archive as bucket (bucket.month)}
      <div class="archive-row">
        <span class="archive-label">{bucket.month}</span>
        <span class="archive-count">
          {String(bucket.count).padStart(2, "0")}
        </span>
      </div>
    {/each}
  </section>

  <p class="rail-footer">
    Written by the people who run it. Notes on WireGuard, identity and the
    boring parts of uptime.
  </p>
</aside>

<style>
  .tag-rail {
    position: sticky;
    top: 28px;
    display: flex;
    flex-direction: column;
    gap: 26px;
  }

  .rail-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .rail-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .rail-rule {
    flex: 1;
    height: 1px;
    background: var(--hair);
  }

  .tag-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 7px 10px;
    border-left: 2px solid transparent;
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--muted);
    transition: background var(--dur-fast) var(--ease);
  }

  .tag-row:hover {
    background: var(--hover);
    color: var(--ink);
  }

  .tag-row.active {
    font-weight: 600;
    color: var(--brand);
    background: var(--brand-tint);
    border-left-color: var(--brand);
  }

  .tag-row-label {
    flex: 1;
  }

  .tag-row-count {
    font-family: var(--font-mono);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: var(--faint);
  }

  .tag-row.active .tag-row-count {
    color: var(--brand);
  }

  .archive-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 7px 10px;
    border-left: 2px solid transparent;
  }

  .archive-label {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 12.5px;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }

  .archive-count {
    font-family: var(--font-mono);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: var(--faint);
  }

  .rail-footer {
    margin: 0;
    border-top: 1px solid var(--hair);
    padding-top: 14px;
    font-size: 11px;
    line-height: 1.5;
    color: var(--faint);
  }
</style>
