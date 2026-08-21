<script>
  let { tone = "neutral", children } = $props();
</script>

<span class="tag" class:brand={tone === "brand"}>
  {@render children()}
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    border-radius: var(--r4);
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    background: var(--panel);
    color: var(--muted);
  }

  .tag.brand {
    background: var(--brand-tint);
    color: var(--brand);
  }
</style>
