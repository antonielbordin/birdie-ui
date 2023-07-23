<script lang="ts">
  import { Router, Route, NotFound } from "slick-svero";
  import Header from './lib/header.svelte';
  import Sidebar from './lib/sidebar.svelte';
  import Home from './lib/home.svelte';
  import Content from './lib/content.svelte';
  import Footer from './lib/footer.svelte';
</script>

<Header />
<Sidebar />

<Router>		
  <Route path="/" component="{Home}" />
  <Route path="/instalation">
    <Content page="instalation" />
  </Route>  
  <Route path="/accordions">
    <Content page="accordions" />
  </Route>
  <Route path="/buttons">
    <Content page="buttons" />
  </Route>
  <Route path="/cards">
    <Content page="cards" />
  </Route>
  <Route path="/datatables">
    <Content page="datatables" />
  </Route>
  <Route path="/dropdowns">
    <Content page="dropdowns" />
  </Route>  
  <Route path="/forms">
    <Content page="forms" />
  </Route>
  <Route path="/layouts">
    <Content page="layouts" />
  </Route>
  <Route path="/tooltips">
    <Content page="tooltips" />
  </Route>
  <Route path="/typography">
    <Content page="typography" />
  </Route>
  <NotFound>
    <p>Not Found</p>
  </NotFound>
</Router>

<Footer />