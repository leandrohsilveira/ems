<script>
    import { cn } from '../../utils/index.js'

    /** @import { PaperProps } from './types.js' */

    /** @type {PaperProps} */
    let { children, class: className, testId = 'paper', element = 'div' } = $props()
</script>

<svelte:element
    this={element}
    data-testid="{testId}-root"
    class={cn('bg-card text-card-foreground border-border rounded-xl border shadow-sm', className)}
>
    {@render children?.()}
</svelte:element>
