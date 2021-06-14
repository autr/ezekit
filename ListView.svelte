<script>
	import { onMount, onDestroy } from 'svelte'
	import utils from './utils.js'
	import ListItem from './ListItem.svelte'

	export let centroid // IMPORTANT
	export let scroller // IMPORTANT

	export let component
	export let keys
	export let data
	export let max = 10
	export let sidebar = false
	export let id

	let browser = utils.browser
	let count = max
	let el

	let class_ = ""
	export { class_ as class }
	let style_ = ""
	export { style_ as style }
	let inited = false

	let timestamp = new Date()
	function tick( ) {

		if (browser) {
			const bottom = scroller.itemsTop > scroller.itemsHeight - (window.innerHeight * 1.5)
			if ( bottom ) more()
			if (!finished) {
				window.requestAnimationFrame(tick)
			} else {
				inited = false
			}
		}

	}

	function reset( data_ ) {
		if (!inited) {
			finished = false
			inited = true
			tick()
		}
	}

	$: reset( data )

	console.log('[listview] 🚁  initialised')

	function more() {
		const t = new Date()
		if (t - timestamp > 500) {
			count += max
			timestamp = t
		}		
	}

	let view = []
	let total = 0

	function render( count_ ) {
		if (!sidebar) return
		view = []
		total = 0
		for (let i = 0; i < count; i++ ) {
			const item = data[i]
			const files = (item?.files||[]).concat( (item.embed||[]))
			files.forEach( file => {
				const { height } = utils.extractDimensions( file )
				const { title } = file
				view.push( { height, title } )
				total += height
			})
		}
	}

	$: render( count )

	let timeout, refresh
	function changed( data_ ) {
		// refresh = true
		// if (timeout) clearTimeout( timeout )
		// timeout = setTimeout( e => refresh = false, 10 )
	}

	$: changed( data )

	// if (browser) tick()
	let unsubscribe

	// onMount( async e => {})

	$: finished = count >= data.length



	$: bounds = el?.getBoundingClientRect() || {}
</script>

{#if sidebar}
	<div 
		class="view flex column-start-stretch fixed h100pc flex" 
		style={`
			left: ${ bounds.left + bounds.width}px;
			top: ${ 16 }px;
			height: ${ browser ? window.innerHeight - 32 : 0 }px;
			margin-left: 1em;
		`}>
		{#each view as item}
			<div 
				class="flex b1-solid grow rel"
				style={`margin-top: -1px;width: 5px;flex-basis: ${((100/total)*item.height).toFixed(1)}%`}>
				<span class="fill" class:filled={ item.title == centroid.title } />
			</div>
		{/each}
	</div>
{/if}
<div 
	{id}
	bind:this={el}
	class="flex column grow {class_}"
	style={style_}>


	<slot name="body" />
	{#each data.slice(0, count) as item, index}
		{#if !refresh}<ListItem {index} {component} {keys} data={item} />{/if}
	{/each	}
	<footer class="flex column-center-center cmb1">
		{#if !finished} 
			<div class="ptb4 f3">
				Loading
			</div>
			<div on:click={more}>
				<slot name="more" /> 
			</div>
		{/if}
		<slot name="top" />
		{#if finished} 
			<slot name="finished" />
		{/if}
	</footer>
</div>