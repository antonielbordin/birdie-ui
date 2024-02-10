<svelte:options tag="bi-accordion" />
<script>
   /**
   * Indicates the type usign in accordion
   * @type {string}
   */
  export let type = 'single';

  export let colapse = false; 
</script>

<div class="bi-accordion">
  <div class="bi-accordion-tabs">
      <slot />
      {#if type === 'single'}
      <div class="bi-accordion-tab">
         <input type="radio" id="rdcolapse" name="rd" checked="{colapse}">
         <label for="rdcolapse" class="bi-accordion-tab-close">Close others &times;</label>
      </div>
      {/if}
  </div>
</div>