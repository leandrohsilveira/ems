<script>
    import { cn } from '../../utils/index.js'
    import Paper from '../paper/paper.svelte'

    /** @import { SidebarProps } from './types.js' */

    /** @type {SidebarProps} */
    let { children, class: className, testId = 'sidebar' } = $props()
</script>

<Paper {testId} element="aside" class={cn('h-full w-64 flex-col border-r', className)}>
    {@render children?.()}
</Paper>
