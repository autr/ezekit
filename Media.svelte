<script>
	import { cubicOut } from 'svelte/easing'
	import { tweened } from 'svelte/motion'


	import { scroll, centroid, autoplay, audio, eze, controls } from './stores.js'
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
	export let paused = true //!$autoplay
	export let root
	export let force = false

	let device = browser ? utils.device() : false

	function join(parts, sep){
	   var separator = sep || '/'
	   var replace   = new RegExp(separator+'{1,}', 'g')
	   return parts.join(separator).replace(replace, separator)
	}

	const DEBUG = false

	if (DEBUG) console.log(`[PostItem] ✨📱✨  using device: ${device}`)

	let class_ = ""
	export { class_ as class }
	let style_ = ""
	export { style_ as style }


	let hidden = autohide ? true : false

	function notify( ratio_, threshold_ ) {
		if (!ratio_ || !threshold_) return
		orientation = ratio_ >= threshold_ ? 'portrait' : 'landscape'
		if (DEBUG) console.log('[media] notifying orientation', orientation)
	}

	$: notify( ratio, threshold )

	let vidSrc, posterSrc, thumb

	const thumbnail = (url, o) => {

		if (DEBUG) console.log('[media] creating thumbnail', url)
		const idx = url.lastIndexOf('.')
		const out = url.slice( 0, idx ) + `.${o?.width || 0}x${o?.height || 0}x${o?.quality || 80}x${o?.fit || 'cover'}` + url.slice( idx )
		return out
	}



	const wait = async ms => ( new Promise(resolve => setTimeout(resolve, ms) ) )
	async function sync( file_ ) {

		if (DEBUG) console.log('[media] syncing file', file_?.basename)

		if (file?.item?.basename && file?.location) {

			if (!root) console.error('[media] no root is set!')

			const basename = file.item.basename
			const idx = basename.lastIndexOf('.')
			const name = basename.slice( 0, idx )
			const ext = basename.slice( idx )
			let fmt = format

			const dim = utils.extractDimensions( file )
			width = parseInt( fmt.split('x')[0] )
			height = parseInt( fmt.split('x')[1] )



			if ( width == 0 ) {
				if (DEBUG) console.log('--- A', {width, height, ratio, dim})
				ratio = dim.ratio
				width = height / ratio
				if (DEBUG) console.log('+++ A', {width, height, ratio, dim})
			} else if ( height == 0 ) {
				if (DEBUG) console.log('--- B', {width, height, ratio, dim})
				ratio = dim.ratio
				height = width * ratio
				if (DEBUG) console.log('+++ B', {width, height, ratio, dim})
			} else if ( isNaN( width ) || isNaN( height ) ) {
				if (DEBUG) console.log('--- C', width, height, ratio)
				width = dim.width
				height = dim.height
				ratio = dim.ratio
				if (DEBUG) console.log('+++ C', {width, height, ratio, dim})
			} else {
				if (DEBUG) console.log('---D', {width, height,ratio,dim})
				ratio = 1
				if (DEBUG) console.log('+++D', {width, height,ratio,dim})
			}

			notify( ratio, threshold )


			if (fmt?.length > 0) fmt = '.' + fmt


			if ($eze.api && $eze.api != '' && $eze.copy) {

				const project = join( [$eze.project, $eze.assets, root]) // root 
				const ezezeze = join( ['/media/', file.location] ) // root

				const formatted = name + fmt + ext // filename
				const rawified = name + ext // filename


				const vidEnd = `?copy=${join( [project, rawified ])}`
				const posterEnd = `?copy=${join( [project, formatted ])}`

				const portly = $eze.api.substring( $eze.api.length-1) == '/' ? $eze.api.substring(0,$eze.api.length-1) : $eze.api

				vidSrc = portly + join( [ ezezeze, rawified + vidEnd ] )
				posterSrc = portly + join( [ ezezeze, formatted + posterEnd ] )

				if (force) {

					await fetch( vidSrc )
					await fetch( posterSrc )
				}

				if (DEBUG) console.log('[media] pinging API to copy file:', name )

			} else {

				vidSrc = join( [ root, name + ext ] )
				posterSrc = join( [ root, name + fmt + ext ] )
			}

			if (DEBUG) console.log('[media] formatted to:', {vidSrc, posterSrc})

		}

	}

	$: sync( file )
	$: title = file?.item?.title
	$: alt = ((file?.item?.title || autohide || file?.item?.basename) || '')

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
		if ($centroid.id == autohide && desktop) paused = !autoplay_
	}

	$: autoplayUpdated( $autoplay )

	let timeout 

	let error = null
	let inited = false
	onMount( async e => {
		inited = true
		setTimeout( e => {
			update( $scroll, $centroid )
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

			const ID = $centroid?.id || 'undefined-centroid'
			const CENTER = $centroid?.center || 999999999

			const center = Math.abs( ( rect.y + (rect.height / 2) ) - (window.innerHeight / 2) )

			if ( autohide == ID && center != CENTER ) {
				$centroid = { center, id: autohide, title }
			}

			if ( center < CENTER && ID != autohide ) {
				console.log(`[PostItem] ✨☯️✨  switching to new centroid "${autohide}" with size: ${width}/${height} (${ratio}), from position ${center} ${CENTER}`, {vidSrc,posterSrc})
				$centroid = { center, id: autohide, title }
			}

			if (desktop) paused = $centroid.id != autohide || !$autoplay
		}, 20)
	}
	$: update( $scroll, $centroid )

	$: color = colors?.vibrant || 'var(--color)'
	$: cross = `background-image: linear-gradient(to top left, transparent 0%, transparent calc(50% - var(--stroke-width)), ${color} 50%, transparent calc(50% + var(--stroke-width)), transparent 100%), linear-gradient(to top right, transparent 0%, transparent calc(50% - var(--stroke-width)), ${color} 50%, transparent calc(50% + var(--stroke-width)), transparent 100%);box-shadow:inset 0px 0px 0px 1px ${color}`

	const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

	let meter = 1

	$: desktop = true //device == 'desktop'
	$: autoplay_final = $autoplay && $centroid.id == autohide

	$: identifiers = {
		mime: 'media-mime-' + utils.slugify( (file?.item?.mime || '').split('/')[0] ),
		width: 'media-width-' + width,
		height: 'media-height-' + height,
		ratio: 'media-ratio-' + ratio,
		orientation: 'media-orientation-' + orientation,
		misc: 'media block rel w100pc ' + class_
	}

	function onVideoClick( e ) {
		if (e.target.requestFullScreen) {
		  e.target.requestFullScreen();
		} else if (e.target.mozRequestFullScreen) {
		  e.target.mozRequestFullScreen();
		} else if (e.target.webkitRequestFullScreen) {
		  e.target.webkitRequestFullScreen();
		} else {
			$autoplay = !$autoplay
		}
	}

	let ogAudio = false
	let ogPaused = false
	function onFullscreenChange( e, v ) {
		const state = document.fullscreenElement == e.target

		if (state) {
			ogAudio = $audio
			ogPaused = paused
			$autoplay = true
		}
		if (!$audio && state) $audio = true
		if (paused && state) paused = false

		if (!state) {
			$audio = ogAudio
			paused = ogPaused
		}
	}


</script>

<span 
	bind:this={el}
	class={ Object.values( identifiers ).join(' ') }
	style={`${style_};${cross};`}>
		{#if error}
			<div class="fill flex row-center-center">
				{error}
			</div>
		{:else}
			{#if is('image') }
				<img 
					class="embed fill w100pc h-auto"
					class:active={!hidden}
					{width}
					{height} 
					src={ hidden ? pixel : posterSrc }
					{title} {alt}  />
			{:else if is('video')} 
				<video 
					bind:this={ videoEl }
					on:play={ onVideoPlay }
					on:click={ onVideoClick }
					on:fullscreenchange={ onFullscreenChange }
					class="embed fill w100pc h-auto z-index66"
					class:active={!hidden}
					class:playing={!paused}
					class:paused={paused}
					poster={ hidden ? pixel : posterSrc }
					{width}
					{height}
					playsinline
					src={ hidden ? pixel : vidSrc }
					muted={!$audio}
					autoplay={  $autoplay && !paused }
					{loop}
					bind:paused={ paused }
					preload={ hidden ? 'none' : 'auto' }
					controls={$controls}
					{title} {alt}  />
			{:else if is('vimeo')}
				<Vimeo 
					{...$$props} 
					bind:width={width} 
					bind:height={height} 
					bind:ratio={ratio} />
			{/if}
		{/if}
		<canvas 
			class="hidden w100pc h-auto"
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