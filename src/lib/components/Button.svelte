<script>
  // The one Button variant this design uses — ghost/sm from the Defguard design system handoff.
  // Add variant/size props if a future screen needs a different look.
  let { onclick, children, ...rest } = $props();
</script>

<button type="button" class="ghost-button" {onclick} {...rest}>
  {@render children()}
</button>

<style>
  .ghost-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 12px;
    background: var(--paper);
    color: var(--ink);
    border: 1px solid var(--hair2);
    border-radius: var(--r5);
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition:
      background var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease);
  }

  .ghost-button:hover {
    background: var(--hover);
  }
</style>
