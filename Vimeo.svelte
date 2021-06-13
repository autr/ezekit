<script>

	import { onMount, onDestroy } from 'svelte'
	import Vimeo from '@vimeo/player'

	export let file
	export let autohide = false // set to an id to enable
	export let format = ''
	export let hidden = autohide ? true : false
	export let paused = true
	export let autoplay = false
	export let muted = true
	export let loop = true
	export let root = null
	export let orientation

	export let width = 1280
	export let height = 720
	export let ratio

	let class_ = ""
	export { class_ as class }
	let style_ = ""
	export { style_ as style }

	let player 

	onMount( async e => {

		if (player) return

	    player = new Vimeo(el, {
	    	url: file.url,
	    	background: false,
	    	width: '100%',
	    	height: 800,
	    	color: '#333',
	    	dnt: true
	    });

	    const playing = await player.on('play', onPlay)

	    const title = await player.getVideoTitle( )
	    width = await player.getVideoWidth( )
	    height = await player.getVideoHeight( )
		ratio = (height/width) * 100
	    console.log('[vimeo] getting dimensions', {title,width,height})

	})

	function onPlay(e) {
		console.log('PLAY!!!')
	}

	onDestroy( async e => {

		if (!player) return

		const res = await player.destroy()
	})


	function update( file_ ) {
	}

	$: update( file )

	// update(file)

	$: id = autohide || 'vimeo-player-untitled'
		
	let el
</script>

<span class="fill vimeo" bind:this={el} id={id} />