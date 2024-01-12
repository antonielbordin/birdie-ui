<script>
  export let open = false
  export let id = 0

</script>

<div class="bi-accordion-tab">
  <input type="radio" id="rd{{id}}" name="rd" checked="{{open}}">
  <label class="bi-accordion-tab-label" for="rd{{id}}">
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