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

<style>
  .bi-nav {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 46px;
    background: rgb(249, 250, 249);
  }
  .bi-nav-start {
    justify-content: flex-start;
  }
  .bi-nav-end {
    justify-content: flex-end;
  }
  .bi-nav-center {
    justify-content: center;
  }
</style>