<script>
  import { navigate } from "../router.svelte.js";

  let { value = "" } = $props();
  // A writable $derived: reassigning `query` (via bind:value below) locally overrides it while
  // typing, and it recomputes from `value` whenever that changes for a reason other than typing
  // — browser back/forward, or clearing search by navigating to "/".
  let query = $derived(value);

  function onSubmit(event) {
    event.preventDefault();
    navigate("/", { q: query });
  }
</script>

<form class="search-form" onsubmit={onSubmit}>
  <input
    type="search"
    placeholder="Search articles..."
    aria-label="Search"
    bind:value={query}
  />
  <button type="submit">Search</button>
</form>
