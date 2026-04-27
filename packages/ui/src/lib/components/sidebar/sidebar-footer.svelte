<script>
    import { cn } from '../../utils/index.js'
    import PaperFooter from '../paper/paper-footer.svelte'

    /** @type {import('./types.js').SidebarSectionProps} */
    let { children, class: className, testId = 'sidebar' } = $props()
</script>

<PaperFooter {testId} class={cn('p-6', className)}>
    {@render children?.()}
</PaperFooter>
