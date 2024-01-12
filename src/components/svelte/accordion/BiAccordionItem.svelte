<script>
  export let open = false

</script>

<div class="bi-accordion-tab">
  <input type="radio" id="rd1" name="rd">
  <label class="bi-accordion-tab-label" for="rd1">
    <slot name="title" />
  </label>
  <div class="bi-accordion-tab-content">
    <slot name="content" />
  </div>
</div>

<!-- 
<div class="bi-accordion-tab">
  <input type="radio" id="rd3" name="rd">
  <label for="rd3" class="bi-accordion-tab-close">Close others &times;</label>
</div> -->