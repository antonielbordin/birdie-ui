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

<style>
  .bi-nav-link {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: auto;
    height: 46px;
    padding: 0 10px;
    background: rgb(249, 250, 249);
  }
  .bi-nav-link:hover,
  .bi-nav-link:active {
    background: #ccc;
    cursor: pointer;
  }
  .bi-nav-link.bi-nav-link-active {
    background: magenta;
  }
</style>