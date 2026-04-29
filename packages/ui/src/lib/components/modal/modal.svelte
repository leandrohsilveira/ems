<script>
    import { cn } from '$lib/utils/index.js'
    import { autoFocus } from '$lib/actions/index.js'

    /**
     * @import { TypedKeyboardEvent } from '$lib/events.js'
     * @import { ModalProps } from './types.js'
     */

    /** @type {ModalProps} */
    let {
        open = $bindable(false),
        children,
        overlayClass,
        class: className,
        testId = 'modal',
        tabindex = 0,
        label,
        onclose
    } = $props()

    /**
     * @param {TypedKeyboardEvent<HTMLElement>} event
     */
    function handleKeydown(event) {
        if (event.key === 'Escape') {
            close()
        }
    }

    function close() {
        open = false
        onclose?.()
    }

    /**
     * @param {HTMLElement} node
     */
    function autoClose(node) {
        node.addEventListener('click', handler)

        return {
            destroy() {
                node.removeEventListener('click', handler)
            }
        }

        /**
         * @param {MouseEvent} event
         */
        function handler(event) {
            if (event.target === node) close()
        }
    }
</script>

{#if open}
    <div
        data-testid="{testId}-overlay"
        class={cn(
            'bg-foreground/20 fixed inset-0 z-50 flex items-center justify-center p-4',
            overlayClass
        )}
        use:autoClose
    >
        <div
            data-testid="{testId}-container"
            class={cn(
                'bg-card text-card-foreground max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl shadow-lg',
                className
            )}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            {tabindex}
            use:autoFocus={{ focusTrap: true }}
            onkeydown={handleKeydown}
        >
            {@render children?.()}
        </div>
    </div>
{/if}
