<script>

	import utils from './utils.js'

	export let relative = false
	export let format = 'DD-MM-YYYY HH:mm:ss'
	export let date

	let class_ = ""
	export { class_ as class }
	let style_ = ""
	export { style_ as style }

	$: timestamp = utils.timestamp( date, format )

</script>

<timestamp class={class_} style={style_}>
	{ timestamp }
	<slot />
</timestamp>