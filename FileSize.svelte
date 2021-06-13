<script>
	import filesize from 'file-size'

	let class_ = ""
	export { class_ as class }
	let style_ = ""
	export { style_ as style }

	export let size

	export let options = {
		fixed: 0,
		spacer: ''
	}

</script>
<span 
	class={class_} 
	style={style_}>
	{filesize(size, options).human().toLowerCase()}
</span>