<svelte:options tag="bi-accordion-item" />
<script>
  /**
   * Indicates is opened tab in accordion item
   * @type {boolean}
   */
  export let open = false
  /**
   * Indicates the id to use as a key in the accordion item
   * @type {string}
   */
  export let id = 0
  /**
   * Indicates the type usign in accordion
   * @type {string}
   */
  export let type = 'single'
</script>

<!-- accordion Single/Multiple -->
<div class="bi-accordion-tab">
  {#if type === 'single'}
  <input type="radio" id="rd{id}" name="rd" checked="{open}">
  {:else}
  <input type="checkbox" id="rd{id}" name="rd" checked="{open}">
  {/if}
  <label class="bi-accordion-tab-label" for="rd{id}">
    <slot name="title" />
  </label>
  <div class="bi-accordion-tab-content">
    <slot name="content" />
  </div>
</div>
 