<script>
  // Live filter — no submit button. The parent owns `value` and re-derives the filtered list on
  // every keystroke (see PostListPage.svelte); this component is just the input's presentation.
  let { value = $bindable("") } = $props();
</script>

<label class="search-box">
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
  <input
    type="text"
    bind:value
    placeholder="Filter posts, tags, authors…"
    aria-label="Filter posts, tags, authors"
  />
</label>

<style>
  .search-box {
    flex: 1;
    min-width: 260px;
    display: flex;
    align-items: center;
    gap: 9px;
    height: 36px;
    padding: 0 11px;
    box-sizing: border-box;
    background: var(--paper);
    border: 1px solid var(--hair2);
    border-radius: var(--r5);
    color: var(--faint);
  }

  .search-box:focus-within {
    border-color: var(--brand);
    box-shadow: 0 0 0 3px var(--brand-tint);
  }

  .search-box input {
    flex: 1;
    min-width: 0;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--ink);
    font-family: var(--font-sans);
    font-size: 13.5px;
  }

  .search-box input::placeholder {
    color: var(--faint);
  }
</style>
