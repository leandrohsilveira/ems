<script>
    import { cn } from '../../utils/index.js'

    /** @import { PaperSectionProps } from './types.js' */

    /** @type {PaperSectionProps} */
    let { children, class: className, testId = 'paper' } = $props()
</script>

<div data-testid="{testId}-content" class={cn(className)}>
    {@render children?.()}
</div>
