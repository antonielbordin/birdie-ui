<svelte:options tag="bi-sidebar-panels" />
<script>
  // To manually toggle the panels externally, e.g. your navigation
	// menu buttons, bind to this function and call it with whatever
	// panel you want to update. Setting left/right to undefined will
	// leave that panel unchanged.
  export const updatePanels = ({ left, right }) => {
		if (left !== undefined) { setLeft(!!left) }
		if (right !== undefined) { setRight(!!right) }
	}
  // The mobile breakpoint determines at what screen width to shift to mobile
	// behaviour. The two behaviour changes are: 1) *only* the left or right panel
	// are allowed to be open, making one visible will hide the other, and 2) the
	// content panel slides to the side, instead of adjusting the width, and a
	// screen/touch-panel is laid over the content, so that tapping the screen
	// will hide the panel.
	export let mobileBreakpoint = 500
// When in mobile mode the content area is overlayed with a touch area, called
	// a screen (named after the theater drop), so that tapping it closes the panel.
	// You'll want to make sure this touch area is wide enough that people can
	// easily and accurately touch it.
	export let screenWidth = '70px'

	// The screen is given 50% opacity, so the content panel is still visible. You
	// can adjust the screen color to re-brand the screen, or to change to a light
	// or dark theme.
	export let screenColor = '#444'

	// These attributes control the window width at which the left/right panels will
	// automatically open (when resizing bigger) or automatically close (when resizing
	// smaller). These also control whether the component initializes with the panels
	// open or closed. To opt out of this automated behaviour, set the property to false.
	export let leftOpenBreakpoint = 768
	export let rightOpenBreakpoint = 1200

	// You can either set an overall width, or different widths for the left and
	// right panels. The width must be a string of any valid CSS "width" value.
	// To completely get rid of a panel, use `0px` as the panel width.
	export let width = '250px'
	export let leftWidth
	export let rightWidth

	// Although it's possible to adjust the duration of the panel open/close animation,
	// you really probably shouldn't. Setting it too low will make the animation feel
	// jarring and induce stress in the user, while setting it too high will make it
	// feel sluggish and will frustrate the user. This value was tested across multiple
	// devices and with different application setups, and is the best compromise between
	// the too-slow/too-fast times.
	export let duration = '0.08s'

	// =============== end of exports ===============

	import { createEventDispatcher, onMount } from 'svelte'
	const dispatch = createEventDispatcher()

	let windowWidth
	let leftOpen
	let leftTransitioning
	let rightOpen
	let rightTransitioning

	const setLeft = (open, transition = true) => {
		leftOpen = open
		leftTransitioning = transition
	}

	const setRight = (open, transition = true) => {
		rightOpen = open
		rightTransitioning = transition
	}

	const onTransitionEnd = ({ propertyName }) => {
		if (propertyName === 'left' || propertyName === 'width') {
			leftTransitioning = false
			rightTransitioning = false
			dispatch('change', { left: leftOpen, right: rightOpen })
		}
	}

	const setPanelStates = transition => () => {
		windowWidth = window.innerWidth
		if (leftOpenBreakpoint && windowWidth > leftOpenBreakpoint) { setLeft(true, transition) }
		if (rightOpenBreakpoint && windowWidth > rightOpenBreakpoint) { setRight(true, transition) }
		if (leftOpenBreakpoint && windowWidth < leftOpenBreakpoint) { setLeft(false, transition) }
		if (rightOpenBreakpoint && windowWidth < rightOpenBreakpoint) { setRight(false, transition) }
		dispatch('change', { left: leftOpen, right: rightOpen })
	}

	onMount(setPanelStates(false))

	const leftScreenOff = () => { setLeft(false) }
	const rightScreenOff = () => { setRight(false) }

	const commonStyles = `
		position: absolute;
		top: 0;
		bottom: 0;
		overflow-y: auto;
	`
	$: mobileMode = windowWidth < mobileBreakpoint
	$: mobilePanelWidth = `calc(100% - ${screenWidth})`

	const generateAsideStyle = (side, width, z) => `
		${commonStyles}
		${side}: 0;
		width: ${width};
		z-index: ${z};
	`
	$: leftAsideStyle = generateAsideStyle('left', mobileMode ? mobilePanelWidth : leftWidth || width, mobileMode && leftOpen ? '3' : '2')
	$: rightAsideStyle = generateAsideStyle('right', mobileMode ? mobilePanelWidth : rightWidth || width, mobileMode && rightOpen ? '2' : '1')

	const generateContentStyle = (side, open, transitioning, color) => `
		${commonStyles}
		${side}: calc(100% - ${screenWidth});
		width: ${screenWidth};
		z-index: ${open && !transitioning ? '5' : '-1'};
		opacity: ${open && !transitioning && '0.5' || '0'};
		background-color: ${color};
	`
	$: leftScreenStyle = mobileMode && generateContentStyle('left', leftOpen, leftTransitioning, screenColor)
	$: rightScreenStyle = mobileMode && generateContentStyle('right', rightOpen, rightTransitioning, screenColor)

	$: contentLeft = mobileMode
		? (leftOpen && `calc(100% - ${screenWidth})` || rightOpen && `calc(${screenWidth} - 100%)` || '0px')
		: (leftOpen ? (leftWidth || width) : '0px')
	$: contentWidth = mobileMode
		? '100%'
		: `calc(100% - ${leftOpen ? (leftWidth || width) : '0px'} - ${rightOpen ? (rightWidth || width) : '0px'})`
	$: contentStyle = `
		${commonStyles}
		left: ${contentLeft};
		width: ${contentWidth};
		transition: width ${duration} ease-in-out, left ${duration} ease-in-out;
		z-index: 5;
	`
</script>

<svelte:window on:resize={setPanelStates(true)}/>

<main style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; overflow-x: hidden;">
	{#if $$slots.left}
		<aside style="{leftAsideStyle}">
			<slot name="left" />
    </aside>
	{/if}

	<section style={contentStyle} on:transitionend={onTransitionEnd}>
		<slot name="content" />
  </section>

	{#if $$slots.right}
		<aside style="{rightAsideStyle}">
			<slot name="right" />
    </aside>
	{/if}

	{#if $$slots.left && mobileMode}
		<section style={leftScreenStyle} on:click={leftScreenOff} on:keypress={leftScreenOff}></section>
	{/if}

	{#if $$slots.right && mobileMode}
		<section style={rightScreenStyle} on:click={rightScreenOff} on:keypress={rightScreenOff}></section>
	{/if}
</main>