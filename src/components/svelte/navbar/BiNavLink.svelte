<svelte:options tag="bi-nav-link" />
<script>
  /**
   * Indicates if the component using rounded
   * @type {boolean}
   */
  export let active = false;
  
</script>

<div
  class="bi-nav-link"
  class:bi-nav-link-active={active}
  >
  <slot />
</div>