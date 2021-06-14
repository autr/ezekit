<script>

    export let scroller = 0
    let class_ = ""
    export { class_ as class }
    let style_ = ""
    export { style_ as style }
    export let el
    
    export let sticky = false

    function set( e, name ) {
        scroller[name + 'Top'] = e.target.scrollTop
        scroller[name + 'Height'] = e.target.scrollHeight
    }

</script>

<div 
    id="layout-top-bar"
    on:click
    on:hover
    bind:this={el}
    on:scroll={ e => set( e, 'items')} 
    class="bg flex w100vw h100vh overflow-auto" style="overflow-x: hidden">
    <div 
        class="flex column-stretch-flex-start margin-auto md-container h100vh grow maxw100vw">
        <slot name="header" />
        <slot name="subheader" />
        <slot name="body" />
        <slot name="footer" />
    </div>
</div>  