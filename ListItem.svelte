<script>

	import { onMount, onDestroy } from 'svelte'

	export let component
	export let index 
	export let data
	export let keys


	function filter( item ) {
		let o = {}
		keys.forEach( key => o[key] = item[key] )
		return o
	}


</script>

<section>
	<svelte:component this={component} {index} {...filter(data) } />
</section>

<!-- 

EXPLANATION:

component = SvelteComponent
index = integer
hidden = boolean (out of view)
centroid = boolean (is the most middle item)
 -->