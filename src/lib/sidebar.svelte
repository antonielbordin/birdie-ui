<script lang="ts">
	let isOpenSide: boolean = false
</script>

<aside id="side-menu">
	<input type="checkbox" id="menuicon" bind:checked={isOpenSide}>
	<div class="menu-toggle">
		<label for="menuicon" class="icon-menus">
			<span></span>
			<span></span>
      <span></span>
    </label>
  </div>
  <section class="sidebar">
		<nav>
			<ul>
				<li><a href="/birdie-ui/" on:click={() => isOpenSide = false}>Welcome</a></li>
				<li><a href="/birdie-ui/instalation" on:click={() => isOpenSide = false}>Installation</a></li>
				<li><a href="">Components</a>
					<ul>
						<li><a href="/birdie-ui/alerts" on:click={() => isOpenSide = false}>Alerts</a></li>
            <li><a href="/birdie-ui/accordions" on:click={() => isOpenSide = false}>Accordions</a></li>
            <li><a href="/birdie-ui/buttons" on:click={() => isOpenSide = false}>Buttons</a></li>
            <li><a href="/birdie-ui/cards" on:click={() => isOpenSide = false}>Cards</a></li>
						<li><a href="/birdie-ui/datatables" on:click={() => isOpenSide = false}>DataTables</a></li>
						<li><a href="/birdie-ui/dropdowns" on:click={() => isOpenSide = false}>Dropdowns</a></li>
            <li><a href="/birdie-ui/forms"on:click={() => isOpenSide = false}>Forms</a></li>
						<li><a href="/layouts" on:click={() => isOpenSide = false}>Layouts & Grids</a></li>						
						<li><a href="/modals" on:click={() => isOpenSide = false}>Modals</a></li>
						<li><a href="/tooltips" on:click={() => isOpenSide = false}>Tooltip</a></li>
						<li><a href="/typography" on:click={() => isOpenSide = false}>Typography</a></li>
					</ul>
				</li>
			</ul>
		</nav>
	</section>
</aside>

<style>
	#side-menu .menu-toggle {
		display: block;
		padding: .5em;
		background: #28324e;
		position: fixed;
		top: 5px;
		left: 15px;
		z-index: 51
	}
	#side-menu .menu-toggle .icon-menus {
		width: 1.5em;
		position: relative;
		display: inline-block;
		height: 1em;
		font-size: 1.5em;
		background: #28324e;
	}
	#side-menu .menu-toggle .icon-menus:hover {
		cursor: pointer
	}
	#side-menu .menu-toggle .icon-menus span {
		width: 100%;
		background: #fff;
		display: block;
		position: absolute;
		left: 0;
		height: .19em;
		border-radius: 1.2px;
		transition: .5s all;
		-webkit-transition: .5s all;
		-ms-transition: .5s all;
		-moz-transition: .5s all;
		-o-transition: .5s all
	}
	#side-menu .menu-toggle .icon-menus span:nth-child(1) {
		top: .13px
	}
	#side-menu .menu-toggle .icon-menus span:nth-child(2) {
		top: .42em
	}
	#side-menu .menu-toggle .icon-menus span:nth-child(3) {
		top: .85em
	}
	#side-menu .sidebar {
		width: 250px;
		height: 100%;
		position: fixed;
		background: #28324e;
		top: 0;
		left: -250px;
		z-index: 50;
		visibility: visible;
		opacity: 0;
		transition: .5s all;
		-webkit-transition: .5s all;
		-ms-transition: .5s all;
		-moz-transition: .5s all;
		-o-transition: .5s all
	}
	#menuicon {
		display: none
	}
	#menuicon:checked ~ .sidebar {
		visibility: visible;
		opacity: 1;
		left: 0
	}
	#menuicon:checked ~ .menu-toggle {
		background: #efefef
	}
	#menuicon:checked ~ .menu-toggle > .icon-menus {
		background: #efefef
	}
	#menuicon:checked ~ .menu-toggle > .icon-menus span {
		top: .36em;
		background: #28324e
	}
	#menuicon:checked ~ .menu-toggle > .icon-menus span:nth-child(1) {
		transform: rotate(45deg);
		-webkit-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		-moz-transform: rotate(45deg);
		-o-transform: rotate(45deg)
	}
	#menuicon:checked ~ .menu-toggle > .icon-menus span:nth-child(2){
		transform: rotate(45deg);
		-webkit-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		-moz-transform: rotate(45deg);
		-o-transform: rotate(45deg)
	}
	#menuicon:checked ~ .menu-toggle > .icon-menus span:nth-child(3){
		transform: rotate(-45deg);
		-webkit-transform: rotate(-45deg);
		-ms-transform: rotate(-45deg);
		-moz-transform: rotate(-45deg);
		-o-transform: rotate(-45deg)
	}
	#side-menu .sidebar ul {
		width: 100%;
		height: 100%;
		margin-top: 60px;
		box-sizing: border-box
	}
	#side-menu .sidebar ul li a {
		display: block;
		font-size: 1.2em;
		font-weight: 700;
		padding: .5em 0;
		color: #efefef;
		-webkit-transition: background 1s ease;
		-moz-transition: background 1s ease;
		transition: background 1s ease;
		text-decoration: none;
		padding-left: 15px;
	}
	#side-menu .sidebar ul li a:hover {
		color: #475577;
		background: #efefef;
		border-right: 5px solid #475577;
		-webkit-transition: background 1s ease;
		-moz-transition: background 1s ease;
		transition: background 1s ease
	}
	#side-menu .sidebar ul li ul {
		display: none;
		margin-top: 0
	}
	#side-menu .sidebar ul li ul li a{
		padding-left: 20px;
	}
	#side-menu .sidebar ul li:hover ul {
		display: block
	}
	#side-menu .sidebar ul li:hover ul li {
		background: #242424
	}
	#side-menu .sidebar ul li:hover ul li a {
		color: #fff;
	}
	#side-menu .sidebar ul li:hover ul li a:hover {
		background: #2e2e2e
	}   
</style>