<script>
    import { cn } from '../../utils/index.js'

    /** @import { PaperProps } from './types.js' */

    /** @type {PaperProps} */
    let { children, header, footer, class: className, testId = 'paper' } = $props()
</script>

<div
    data-testid="{testId}-root"
    class={cn('bg-card text-card-foreground border-border rounded-xl border shadow-sm', className)}
>
    {#if header}
        <div data-testid="{testId}-header" data-header class="p-10">
            {@render header()}
        </div>
    {/if}

    {#if children}
        <div data-testid="{testId}-content" class="p-10 pt-0">
            {@render children()}
        </div>
    {/if}

    {#if footer}
        <div data-testid="{testId}-footer" data-footer class="p-10 pt-0">
            {@render footer()}
        </div>
    {/if}
</div>
