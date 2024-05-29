<svelte:options tag="bi-nav" />
<script>
  /**
   * Indicates position for align component
   * @type {'start'|'end'|'center'|string}
   */
  export let position = '';
  
</script>

<nav
  class="bi-nav"
  class:bi-nav-start={position === "left"}
  class:bi-nav-end={position === "right"}
  class:bi-nav-center={position === "center"}
  >
  <slot />
</nav>