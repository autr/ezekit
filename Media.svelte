<script>
	import { cubicOut } from 'svelte/easing'
	import { tweened } from 'svelte/motion'


	export let autoplaying // IMPORTANT
	export let muted // IMPORTANT
	export let scroller // IMPORTANT
	export let centroid // IMPORTANT
	export let eze // IMPORTANT

	$: audio = !muted

	import { onMount, onDestroy } from 'svelte'
	import Vimeo from './Vimeo.svelte'
	import utils from './utils.js'

	let browser = utils.browser

	export let file
	export let autohide = false // set to an id to enable
	export let format = ''
	export let loop = true
	export let threshold = 0.75
	export let orientation = null
	export let paused = true //!autoplaying
	export let root
	export let force = false
	export let controls = false
	export let stretch = 'width' // or height

	const DEBUG = true

	let class_ = ""
	export { class_ as class }
	let style_ = ""
	export { style_ as style }


	let device = browser ? utils.device() : false
	let hidden = autohide ? true : false
	let vidSrc, posterSrc, thumb

	const wait = async ms => ( new Promise(resolve => setTimeout(resolve, ms) ) )

	// ---------- notify -------------

	$: notify( ratio, threshold )
	function notify( ratio_, threshold_ ) {
		if (!ratio_ || !threshold_) return
		orientation = ratio_ >= threshold_ ? 'portrait' : 'landscape'
		if (DEBUG) console.log('[media] notifying orientation', orientation)
	}



	// ---------- sync -------------

	const join = (parts, sep) => {
	   var separator = sep || '/'
	   var replace   = new RegExp(separator+'{1,}', 'g')
	   return parts.join(separator).replace(replace, separator)
	}

	$: sync( file )
	async function sync( file_ ) {

		if (!file_) return // TODO ERROR MESSAGES

		let { id, location } = file_
		let { ext, name } = file_?.item || {}
		ratio = file_?.item?.ratio
		ext = ext ? '.' + ext : ext

		if (DEBUG) console.log('[media] syncing file', location, id, format)


		if (id && location && ext && name) {

			if (!root) console.error('[media] no root is set!')

			let fmt = format

			width = parseInt( fmt.split('x')[0] )
			height = parseInt( fmt.split('x')[1] )

			if ( width == 0 ) {
				width = height / ratio
			} else if ( height == 0 ) {
				height = width * ratio
			} else if ( isNaN( width ) || isNaN( height ) ) {
				width = file_.item.width
				height = file_.item.height
			} else {
				ratio = 1
			}

			notify( ratio, threshold )


			if (fmt?.length > 0) fmt = '.' + fmt


			if (eze?.api && eze?.api != '' && eze?.copy) {



				const project = join( [eze.project, eze.assets, root]) // root 
				const ezezeze = join( ['/media/', file.location] ) // root

				const formatted = name + fmt + ext // filename
				const rawified = name + ext // filename


				const vidEnd = `?copy=${join( [project, rawified ])}`
				const posterEnd = `?copy=${join( [project, formatted ])}`

				const portly = eze.api.substring( eze.api.length-1) == '/' ? eze.api.substring(0,eze.api.length-1) : eze.api

				vidSrc = portly + join( [ ezezeze, rawified + vidEnd ] )
				posterSrc = portly + join( [ ezezeze, formatted + posterEnd ] )

				if (force) {

					await fetch( vidSrc )
					await fetch( posterSrc )
				}

				if (DEBUG) console.log('[media] pinging API to copy file:', name )

			} else {
				// console.log('[media] pinging API to copy file:', name )
				vidSrc = join( [ root, name + ext ] )
				posterSrc = join( [ root, name + fmt + ext ] )
			}

			if (DEBUG) {
				console.log('[media] formatted to:')
				console.log(`[media] video thumbnail: ${vidSrc}`)
				console.log(`[media] thumb thumbnail: ${vidSrc}`)
			}

		} else {
			console.error('[media] media file is missing id location ext name:', { id, location, ext, name}, file_ )
			console.error('[media] media file:', file_ )
		}

	}

	let width = null, height = null, ratio = null

	function colors_( file_ ) {
		if (!file?.item?.vibrant) return {}
		let o = {}
		for (const [key, value] of Object.entries( file.item.vibrant )) {
			o[key.toLowerCase()] = `rgb(${value.rgb.join(',')})`
		}
		return o

	}

	let videoEl


	$: colors = colors_( file )


	const is = str => utils.isFileType( str, file )

	let el

	function autoplayUpdated( autoplay_ ) {
		if (centroid?.id == autohide && desktop) paused = !autoplay_
	}

	$: autoplayUpdated( autoplaying )

	let timeout 

	let error = null
	let inited = false
	onMount( async e => {
		inited = true
		setTimeout( e => {
			update( scroller, centroid )
		}, 100 )
	})

	function playing( paused_ ) {
		if (!paused_ && !inited) paused = true
	}

	$: playing( paused )

	function onVideoPlay() {
	}

	function update( scroll_, centroid_ ) {

		if (!browser || !autohide || !inited) return

		if (timeout) {
			clearTimeout( timeout )
			timeout = null
		}

		const rect = el?.getBoundingClientRect() || {}
		const offset = -window.innerHeight

		const top = rect.y * -1 > rect.height - offset
		const bottom = rect.y > window.innerHeight - offset
		hidden = top || bottom
		
		timeout = setTimeout( e => {

			const ID = centroid?.id || 'undefined-centroid'
			const CENTER = centroid?.center || 999999999

			const center = Math.abs( ( rect.y + (rect.height / 2) ) - (window.innerHeight / 2) )

			if ( autohide == ID && center != CENTER ) {
				centroid = { center, id: autohide }
			}

			if ( center < CENTER && ID != autohide ) {
				console.log(`[media] ☯️  new centroid : ${width}/${height}/${(ratio||0).toFixed(2)} ${autohide}`)
				centroid = { center, id: autohide }
			}

			if (desktop) paused = centroid.id != autohide || !autoplaying
		}, 20)
	}
	$: update( scroller, centroid )

	$: color = colors?.vibrant || 'var(--color)'
	$: cross = `background-image: linear-gradient(to top left, transparent 0%, transparent calc(50% - var(--stroke-width)), ${color} 50%, transparent calc(50% + var(--stroke-width)), transparent 100%), linear-gradient(to top right, transparent 0%, transparent calc(50% - var(--stroke-width)), ${color} 50%, transparent calc(50% + var(--stroke-width)), transparent 100%);box-shadow:inset 0px 0px 0px 1px ${color}`

	const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

	let meter = 1

	$: desktop = true //device == 'desktop'
	$: autoplay_final = autoplaying && centroid?.id == autohide

	$: identifiers = {
		mime: 'media-mime-' + utils.slugify( (file?.item?.mime || '').split('/')[0] ),
		width: 'media-width-' + width,
		height: 'media-height-' + height,
		ratio: 'media-ratio-' + ratio,
		orientation: 'media-orientation-' + orientation
	}

	function onVideoClick( e ) {
		if (e.target.requestFullScreen) {
		  e.target.requestFullScreen();
		} else if (e.target.mozRequestFullScreen) {
		  e.target.mozRequestFullScreen();
		} else if (e.target.webkitRequestFullScreen) {
		  e.target.webkitRequestFullScreen();
		} else {
			autoplaying = !autoplaying
		}
	}

	let ogAudio = false
	let ogPaused = false
	function onFullscreenChange( e, v ) {
		const state = document.fullscreenElement == e.target

		if (state) {
			ogAudio = audio
			ogPaused = paused
			autoplaying = true
		}
		if (!audio && state) audio = true
		if (paused && state) paused = false

		if (!state) {
			audio = ogAudio
			paused = ogPaused
		}
	}

	$: stretchClasses = stretch == 'width' ? 'w100pc h-auto' : 'w-auto h100pc'

</script>

<span 
	bind:this={el}
	class={ `${Object.values( identifiers ).join(' ')} media block rel overflow-hidden ${stretchClasses} ${class_}` }
	style={`${style_};${cross};`}>
		{#if error}
			<div class="fill flex row-center-center">
				{error}
			</div>
		{:else}
			{#if is('image') }
				<img 
					class="embed fill {stretchClasses}"
					class:active={!hidden}
					{width}
					{height} 
					src={ hidden ? pixel : posterSrc }  />
			{:else if is('video')} 
				<video 
					bind:this={ videoEl }
					on:play={ onVideoPlay }
					on:click={ onVideoClick }
					on:fullscreenchange={ onFullscreenChange }
					class="embed fill {stretchClasses} z-index66"
					class:active={!hidden}
					class:playing={!paused}
					class:paused={paused}
					poster={ hidden ? pixel : posterSrc }
					{width}
					{height}
					playsinline
					src={ hidden ? pixel : vidSrc }
					muted={!audio}
					autoplay={  autoplaying && !paused }
					{loop}
					bind:paused={ paused }
					preload={ hidden ? 'none' : 'auto' }
					controls={controls}  />
			{:else if is('vimeo')}
				<Vimeo 
					{...$$props} 
					bind:width={width} 
					bind:height={height} 
					bind:ratio={ratio} />
			{/if}
		{/if}
		<canvas 
			class="hidden {stretchClasses}"
			{width}
			{height} />
</span>


<!-- 
		background:linear-gradient(45deg, ${colors?.vibrant}, ${colors?.lightvibrant});
		background: repeating-linear-gradient(
			0deg,
			${colors?.vibrant} 0px,
			${colors?.vibrant} 1px,
			${colors?.darkvibrant} 1px,
			${colors?.darkvibrant} 2px
		);
		padding-top:${ratio()}%; 
		background: repeating-linear-gradient(
			0deg,
			${colors?.vibrant} 0px,
			${colors?.vibrant} 1px,
			${colors?.darkvibrant} 1px,
			${colors?.darkvibrant} 2px
		);


 -->