
<script lang="ts">
    import birdieUI from '/public/birdie-ui.svg';
</script>

<header id="header">
    <section class="header-logo">
        <img src={birdieUI} alt="Birdie UI" title="Birdie UI" />
    </section>
    <section class="header-links">
        <span class="hl-version">v1.0.0</span> 
        <a href="https://github.com/stilosdesign/birdie-ui" data-bi="tooltip" bi-tooltip-pos="bottom" bi-tooltip="View on GitHub" target="_blank" class="hl-version"> Github </a>        
    </section>
</header>

<style>
    #header {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 56px;
        background: #f6f6f6;
        border-bottom: 1px solid #e0e0e0;
        position: fixed;
        top: 0;
        z-index: 49;
    }
    #header .header-logo {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        width: 80%;
        height: 100%;
    }
    #header .header-logo img {
       max-width: 30% !important;
       max-height: 80% !important;
       margin-left: 100px;
    }
    #header .header-links {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 20%;
        height: 100%;
    }
    #header .header-links .hl-version,
    #header .header-links .hl-github {
        padding: 8px 12px;
        font-size: 14px;
        font-weight: 500;
        line-height: 16px;
        color: #28324e;
        transition: color 0.2s;
        text-decoration: none;
    }   
</style>