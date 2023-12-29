<script>
  import { createEventDispatcher } from "svelte";
  export let text = '';
  export let type = 'default';
	export let size = 'normal';
	export let rounded = false;
  export let circle = false;
  export let disabled = false;

  const dispatch = createEventDispatcher();
     
  function onClick(event) {
    dispatch("click", event);
  }     
</script>

<button
  class:bi-btn={type === 'default'}
  class:bi-btn-primary={type === 'primary'}
  class:bi-btn-secondary={type === 'secondary'}
  class:bi-btn-danger={type === 'danger'}
  class:bi-btn-success={type === 'success'}
  class:bi-btn-warning={type === 'warning'}
  class:bi-btn-info={type === 'info'}
  class:bi-btn-text={type === 'text'}
  class:bi-btn-link={type === 'link'}
  class:bi-btn-small={size === 'small'}
  class:bi-btn-large={size === 'large'}
  class:bi-btn-full={size === 'full'}
  class:bi-btn-round={rounded}
  class:bi-btn-circle={circle}
  class:bi-btn-disabled={disabled}
  on:click={onClick}
>
  {text}
	<slot />
</button>

<style>
  /** ------------------------------- 
  --       Birdie Buttons          --
  -------------------------------- */
  /** Birdie Button reset comportament in browser */ 
  .bi-btn,
  .bi-btn-primary::-moz-focus-inner,
  .bi-btn-secondary::-moz-focus-inner,
  .bi-btn-success::-moz-focus-inner,
  .bi-btn-danger::-moz-focus-inner,
  .bi-btn-warning::-moz-focus-inner,
  .bi-btn-info::-moz-focus-inner {
    border: none;
  }
  /** Birdie Button default options */
  .bi-btn,
  .bi-btn-primary,
  .bi-btn-secondary,
  .bi-btn-success,
  .bi-btn-danger,
  .bi-btn-warning,
  .bi-btn-info,
  .bi-btn-text,
  .bi-btn-link {   
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    min-width: 64px;
    padding: 8px 12px;
    vertical-align: middle;
    text-align: center;
    text-overflow: ellipsis;
    text-transform: uppercase;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
    outline: none;
    border: none;
    cursor: pointer;   
  }  
  .bi-btn-text,
  .bi-btn-link {
    padding: 2px;
    background: none; 
  } 
  /** Birdie Button Hover and Focus */
  .bi-btn:hover,
  .bi-btn:focus {      
    box-shadow: inset 0 0 10px 5px rgba(143, 143, 143, 0.1); 
  }
  .bi-btn-primary:hover,
  .bi-btn-primary:focus,
  .bi-btn-secondary:hover,
  .bi-btn-secondary:focus,
  .bi-btn-success:hover,
  .bi-btn-success:focus,
  .bi-btn-danger:hover,
  .bi-btn-danger:focus,
  .bi-btn-warning:hover,
  .bi-btn-warning:focus,
  .bi-btn-info:hover,
  .bi-btn-info:focus {      
    box-shadow: inset 0 0 10px 5px rgba(80, 80, 80, 0.1); 
  }
  .bi-btn-link:hover,
  .bi-btn-link:focus {
    color: #0275d8;
    transition: color 0.2s;
  }
  /** Birdie Button Disabled */
  .bi-btn:disabled,
  .bi-btn-primary:disabled,
  .bi-btn-secondary:disabled,
  .bi-btn-success:disabled,
  .bi-btn-danger:disabled,
  .bi-btn-warning:disabled,
  .bi-btn-info:disabled,
  .bi-btn-disabled {
    box-shadow: none;
    cursor: initial;
    opacity : 0.6;
  }
  /** Birdie Button Colors */
  .bi-btn {
    color: rgba(0, 0, 0, 0.38);
    background-color: #f1f1f1;
  }
  .bi-btn-primary {  
    color: #f7f7f7;
    background-color: #0275d8;
  }
  .bi-btn-secondary {
    color: #f7f7f7;
    background-color: #5bc0de;
  }
  .bi-btn-success {
    color: #f7f7f7;
    background-color: #5cb85c;
  }
  .bi-btn-danger {   
    color: #f7f7f7;
    background-color: #d9534f;
  }
  .bi-btn-warning {  
    color: #f7f7f7;
    background-color: #f0ad4e;
  }
  .bi-btn-info {
    color: #f7f7f7;
    background-color: #5bc0de;
  }
  .bi-btn-text {
    color: #545454; 
  }
  .bi-btn-link {
    color: #0275d8;
  }
  /** Birdie Button Size and custom */
  .bi-btn-small {
    padding: 3px 6px;
    font-size: 12px;
  }
  .bi-btn-large {
    padding: 12px 24px; 
    font-size: 16px;
  } 
  .bi-btn-full {
    display: block;
  }
  .bi-btn-round {
    border-radius: 4px;
  }
  .bi-btn-circle {   
    width: 60px;
    height: 60px;
    padding: 0;
    border-radius: 50%;
  }
</style>