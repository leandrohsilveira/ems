<script>
    import { cn } from '../../utils/index.js'

    /** @type {import('./types.js').ModalSectionProps} */
    let { children, class: className, testId = 'modal' } = $props()
</script>

<div data-testid="{testId}-actions" class={cn('flex flex-col gap-3 p-10 pt-0', className)}>
    {@render children?.()}
</div>
