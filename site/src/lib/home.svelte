<script lang="ts">
    import birdieUI from '/public/birdie-ui.svg';
</script>

<div class="bi-container-fixed">
    <div class="bi-row">
        <div class="bi-column">
            <header class="header-home">
                <img src={birdieUI} alt="Birdie UI" title="Birdie UI" />
                <h1>Speed up your web development with <span style="font-weight:bold;color:#E75C21;">Birdie UI</span></h1>
                <p>Library of UI components that you can use to launch any web project</p>
            </header>            
            <section class="actions">
                <span class="npm-install">npm install birdie-ui </span>
                <a href="/instalation" class="get-started bi-no-decoration">Get started </a>
            </section>
        </div>        
    </div>
</div>

<style>
    .header-home {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-top: 100px;
        margin-bottom: 50px;
    }
    .header-home h1 {
        color: #28324E;
        padding-top: 80px;
        width: 80%;
        text-align: center;
    }
    .actions {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 25px;
        margin-bottom: 80px;
    }
    .npm-install {
        padding: 15px 25px;
        background: #28324E;
        color: #f6f6f6;
        border-radius: 4px;
        margin-right: 25px;
    }
    .get-started {
        padding: 15px 25px;
        background: #EC421E;
        color: #f6f6f6;
        border-radius: 4px;
        margin-right: 25px;
        cursor: pointer;
    }
   .get-started:hover {
        background: #E75C21;
   }
 </style>