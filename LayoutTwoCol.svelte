<script>

    export let scroller = 0

	let class_ = ""
	export { class_ as class }
	let style_ = ""
	export { style_ as style }
	export let el

	function set( e, name ) {
		scroller[name + 'Top'] = e.target.scrollTop
		scroller[name + 'Height'] = e.target.scrollHeight
	}

	const width = '400px'

</script>


<div 
	on:click
	on:hover
	bind:this={el}
    on:scroll={ e => set( e, 'items')} 
    class="flex row-center-stretch w100vw h100vh overflow-auto {class_}" style="overflow-x: hidden; {style_}">
    <div class="md-container flex ">

		<div class="abs w{width} pr1 br mr1 overflow-auto flex column-start-space-between">
			<div>
				<slot name="header" />
			</div>
			<div>
				<slot name="footer" />
			</div>
		</div>
		<span class="w{width} pop" />
		<article class="grow">
			<slot name="body" />
		</article>
	</div>
</div>