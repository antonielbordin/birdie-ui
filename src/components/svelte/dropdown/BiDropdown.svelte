<svelte:options tag="bi-dropdown" />

<script>
  import { createEventDispatcher } from "svelte";
  
</script>

<span class="bi-dropdown">
  <button>Action</button>
  <label>
     <input type="checkbox">
     <ul>
        <li>Action</li>
        <li>Another Action</li>
        <li>Test</li>
        <li class="bi-dropdown-divider"></li>
        <li>Separated link</li>
     </ul>
  </label>
</span>


<style>

</style>