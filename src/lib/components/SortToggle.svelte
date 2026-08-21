<script>
  let { sortKey, sortDir, onSelect } = $props();

  const OPTIONS = [
    { key: "date", label: "Date" },
    { key: "title", label: "Title" },
  ];
</script>

<div class="sort-toggle">
  {#each OPTIONS as opt (opt.key)}
    <button
      type="button"
      class="sort-btn"
      class:active={sortKey === opt.key}
      aria-pressed={sortKey === opt.key}
      onclick={() => onSelect(opt.key)}
    >
      <span>{opt.label}</span>
      {#if sortKey === opt.key}
        <span class="sort-arrow">{sortDir === "desc" ? "↓" : "↑"}</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .sort-toggle {
    display: flex;
    border: 1px solid var(--hair2);
    border-radius: var(--r5);
    overflow: hidden;
  }

  .sort-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 12px;
    border: none;
    border-left: 1px solid var(--hair2);
    background: var(--paper);
    color: var(--muted);
    font-family: var(--font-sans);
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
  }

  .sort-btn:hover:not(.active) {
    background: var(--hover);
    color: var(--ink);
  }

  .sort-btn.active {
    background: var(--brand-tint);
    color: var(--brand);
    font-weight: 600;
  }

  .sort-arrow {
    font-family: var(--font-mono);
    font-size: 11px;
  }
</style>
