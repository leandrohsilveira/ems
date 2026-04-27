<script>
    import { cn } from '../../utils/index.js'
    import PaperContent from '../paper/paper-content.svelte'

    /** @type {import('./types.js').SidebarSectionProps} */
    let { children, class: className, testId = 'sidebar' } = $props()
</script>

<PaperContent {testId} class={cn('flex-1 overflow-y-auto px-4', className)}>
    <nav>{@render children?.()}</nav>
</PaperContent>
