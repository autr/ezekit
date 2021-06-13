<script>
	import utils from './utils.js'

	export let min = 0
	export let max = 0
	export let font = 0
	export let icon = 0
	export let el

	let prevFont = 'init'
	let prevIco = 'init'
	let fontStr = ''
	let icoStr = ''

	let enabled = utils.browser ? window.location.search == '?redesign' : false

	function update( min_, max_, icon_ ) {
		if (!enabled) return
		if (!el) return

			console.log('!!!', icon)

		if (min_ > 0 && max_ > 0) {
			fontStr = `font-${min_}-${max_}`
			el.classList.remove(prevFont)
			el.classList.add(fontStr)
			prevFont = fontStr
		}

		if (icon_ > 0) {
			icoStr = `ico-${icon_}`
			console.log('STRING')
			el.classList.remove(prevIco)
			el.classList.add(icoStr)
			prevIco = icoStr
		}
	}

	update(min,max,icon)

	function reset( min_ ) {
		max = 1
	}

	$: reset( min )

	$: update( min, max )

	const c = `p0 w2em h2em flex row-center-center` 

	function key( e ) {
		if (!enabled) return

		if (e.key == 'ArrowLeft' || e.key == 'a') min -= 1
		if (e.key == 'ArrowRight' || e.key == 'd') min += 1

		if (e.key == 'ArrowDown' || e.key == 's') max -= 1
		if (e.key == 'ArrowUp' || e.key == 'w') max += 1

		if (e.key == '-' || e.key == 'z') font -= 1
		if (e.key == '=' || e.key == 'x') font += 1

		if (e.key == '[') icon -= 1
		if (e.key == ']') icon += 1

		update( min, max, icon )

	}

	$: size = `
<style>
:root {
	--font-size: ${font}px;
}
</style>
`

</script>


<svelte:window on:keydown={key} />

{#if enabled}
	<div class="p2 flex column-stretch-center monospace fixed r0 t0 cmb1">
		<button class={c} on:click={e => min-=1}>-</button>
		<div class={c}>{min}</div>
		<button class={c} on:click={e => min+=1}>+</button>

		<button class={c} on:click={e => max-=1}>-</button>
		<div class={c}>{max}</div>
		<button class={c} on:click={e => max+=1}>+</button>

		<button class={c } on:click={e => icon-=1}>-</button>
		<div class={c}>{icon}</div>
		<button class={c} on:click={e => icon+=1}>+</button>

	</div>
	<div class="h2em flex row-center-center filled fixed l1 t1">{icoStr} {fontStr} {font || '~'}px</div>
	{@html size > 0 ? size : ''}
{/if}