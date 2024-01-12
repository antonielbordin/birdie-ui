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
     {#if type === 'multiple'}
     <div class="bi-accordion-tab">
         <input type="radio" id="rd3" name="rd" checked="{colapse}">
         <label for="rd3" class="bi-accordion-tab-close">Close others &times;</label>
      </div>
      {/if}
  </div>
</div>

<!-- accordionMultiple -->
<div class="bi-accordion">
   <div class="bi-accordion-tabs">
      <div class="bi-accordion-tab">
         <input type="checkbox" id="chck1">
         <label class="bi-accordion-tab-label" for="chck1">Item 1</label>
         <div class="bi-accordion-tab-content">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!
         </div>
      </div>
      <div class="bi-accordion-tab">
         <input type="checkbox" id="chck2">
         <label class="bi-accordion-tab-label" for="chck2">Item 2</label>
         <div class="bi-accordion-tab-content">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. A, in!
         </div>
      </div>
   </div>
</div>






<style>

</style>