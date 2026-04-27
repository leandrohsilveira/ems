<script>
    import { cn } from '../../utils/index.js'
    import PaperHeader from '../paper/paper-header.svelte'

    /** @type {import('./types.js').SidebarSectionProps} */
    let { children, class: className, testId = 'sidebar' } = $props()
</script>

<PaperHeader {testId} class={cn('p-6', className)}>
    {@render children?.()}
</PaperHeader>
