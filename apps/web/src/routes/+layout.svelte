<script>
    import '$lib/index.css'
    import favicon from '$lib/assets/favicon.svg?url'

    let { children } = $props()
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
