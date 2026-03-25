<script>
    import { cn } from '../../utils'

    /** @import { PaperProps } from '@ems/types-frontend-ui' */

    /** @type {PaperProps} */
    let { children, header, footer, class: className } = $props()
</script>

<div
    class={cn('bg-card text-card-foreground border-border rounded-xl border shadow-sm', className)}
>
    {#if header}
        <div data-header class="p-10">
            {@render header()}
        </div>
    {/if}

    {#if children}
        <div class="p-10 pt-0">
            {@render children()}
        </div>
    {/if}

    {#if footer}
        <div data-footer class="p-10 pt-0">
            {@render footer()}
        </div>
    {/if}
</div>
