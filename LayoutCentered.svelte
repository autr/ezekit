<script>
	import { scroll } from './stores.js'
	
	let class_ = ""
	export { class_ as class }
	let style_ = ""
	export { style_ as style }
	export let el

	function set( e, name ) {
		$scroll[name + 'Top'] = e.target.scrollTop
		$scroll[name + 'Height'] = e.target.scrollHeight
	}
</script>

<div 
	on:click
	on:hover
	bind:this={el}
    on:scroll={ e => set( e, 'items')} 
	class="{class_} layout-centered flex row-center-center grow h100pc overflow-auto" 
	style={style_}>
	<div class="margin-auto flex column-stretch-center">
		<slot />
	</div>
</div>

