<script>
    import { cn } from '../../utils/index.js'

    /** @import { ModalProps } from './types.js' */

    /** @type {ModalProps} */
    let { open = false, children, class: className, testId = 'modal' } = $props()
</script>

{#if open}
    <div
        data-testid={testId}
        class={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4', className)}
        role="dialog"
        aria-modal="true"
    >
        <div
            data-testid="{testId}-container"
            class="bg-card text-card-foreground max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl shadow-lg"
        >
            {@render children?.()}
        </div>
    </div>
{/if}
