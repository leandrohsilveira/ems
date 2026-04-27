<script>
    import { cn } from '../../utils/index.js'

    /** @type {import('./types.js').ModalSectionProps} */
    let { children, class: className, testId = 'modal' } = $props()
</script>

<div data-testid="{testId}-header" class={cn('p-10', className)}>
    {@render children?.()}
</div>
