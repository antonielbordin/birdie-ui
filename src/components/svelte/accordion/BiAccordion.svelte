<svelte:options tag="bi-accordion" />
<script>
  import { createEventDispatcher } from "svelte";
  // export let accordionType = 'single';
  // export let colapse = false;

  const dispatch = createEventDispatcher();

  const items = [
   { title: 'Item 1', content: 'Content 1' },
   { title: 'Item 2', content: 'Content 2' },
   { title: 'Item 3', content: 'Content 3' },
   { title: 'Item 4', content: 'Content 4' },
   { title: 'Item 5', content: 'Content 5' }
  ]
</script>

<!-- accordionSingle -->
<div class="bi-accordion">
  <div class="bi-accordion-tabs">
     <slot />
  </div>
</div>

<!-- accordionMultiple -->

<style>

</style>