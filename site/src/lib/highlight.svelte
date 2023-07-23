<script lang="ts">
export let lang = "";
export let content = "";
import Prism from 'prismjs';    

</script>

<svelte:head>
  <!-- <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.22.0/themes/prism.min.css" rel="stylesheet" /> -->
  <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />   
</svelte:head>

<style>
    .code {
        white-space: pre-wrap;
        border-radius:0.2em;
        background: #2d2d2d !important;
        width: 100%;
    }  
</style>
    
<div class="code">
    {@html Prism.highlight(content, Prism.languages[lang])}
</div>