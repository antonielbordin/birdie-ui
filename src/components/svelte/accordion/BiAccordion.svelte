<script>
  import { createEventDispatcher } from "svelte";
  export let accordionType = 'single';

  const dispatch = createEventDispatcher();
</script>

 
<!-- accordionSingle -->

<div class="bi-accordion">
  <div class="bi-accordion-tabs">
     <div class="bi-accordion-tab">
        <input type="radio" id="rd1" name="rd">
        <label class="bi-accordion-tab-label" for="rd1">Item 1</label>
        <div class="bi-accordion-tab-content">
           Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!
        </div>
     </div>
     <div class="bi-accordion-tab">
        <input type="radio" id="rd2" name="rd">
        <label class="bi-accordion-tab-label" for="rd2">Item 2</label>
        <div class="bi-accordion-tab-content">
           Lorem ipsum dolor sit amet consectetur adipisicing elit. A, in!
        </div>
     </div>
     <div class="bi-accordion-tab">
        <input type="radio" id="rd3" name="rd">
        <label for="rd3" class="bi-accordion-tab-close">Close others &times;</label>
     </div>
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