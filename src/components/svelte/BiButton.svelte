<script>
  /**
   * Indicates text for using in component.
   * @type {string|undefined}
   */
  export let text = undefined;
  /**
   * Indicates type for using in component.
   * @type {'primary'|'secondary'|'danger'|'success'|'warning'|string}
   */
  export let type = '';
  /**
   * Size of the component.
   * @type {'small'|'large'|'full'|string}
   */
   export let size = '';  
  /**
   * Indicates if the component using rounded .
   * @type {boolean}
   */
	export let rounded = false;
  /**
   * Indicates if the component using circle .
   * @type {boolean}
   */
  export let circle = false;
  /**
   * Indicates if the component is disabled.
   * @type {boolean}
   */
  export let disabled = false;

  let isDefault = false;

  if (
    type !== "primary" && 
    type !== "secondary" && 
    type !== "danger" && 
    type !== "success" && 
    type !== "warning" && 
    type !== "info") {
    isDefault = true;
  }
 
</script>

<button
  {...$$props}
  class:bi-btn={isDefault}
  class:bi-btn-primary={type === "primary"}
  class:bi-btn-secondary={type === "secondary"}
  class:bi-btn-danger={type === "danger"}
  class:bi-btn-success={type === "success"}
  class:bi-btn-warning={type === "warning"}
  class:bi-btn-info={type === "info"}
  class:bi-btn-small={size === "small"}
  class:bi-btn-large={size === "large"}
  class:bi-btn-full={size === "full"}
  class:bi-btn-round={rounded}
  class:bi-btn-circle={circle}
  class:bi-btn-disabled={disabled}  
  on:click
>
  {#if text}
    {text}
  {:else}
    <slot>
      <em>Button is empty</em>
    </slot>
  {/if}
</button>

<style>

</style>