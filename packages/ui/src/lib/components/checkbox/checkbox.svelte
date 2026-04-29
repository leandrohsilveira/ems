<script>
    import { cn } from '../../utils/index.js'

    /** @import { CheckboxProps } from './types.js' */

    /** @type {CheckboxProps} */
    let {
        label,
        description,
        checked = $bindable(false),
        disabled = false,
        class: className,
        id,
        ...restProps
    } = $props()

    let checkboxId = $derived(id ?? `checkbox-${Math.random().toString(36).slice(2, 9)}`)
</script>

<div data-testid="checkbox-wrapper" class={cn('flex items-start gap-2', className)}>
    <div class="relative flex items-center justify-center">
        <input
            type="checkbox"
            id={checkboxId}
            bind:checked
            {disabled}
            class={cn(
                'border-input bg-background h-4 w-4 cursor-pointer rounded border',
                'checked:bg-primary checked:border-primary',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                'disabled:not-checked:bg-muted disabled:cursor-not-allowed disabled:opacity-50',
                'transition-colors'
            )}
            {...restProps}
        />
        {#if checked}
            <svg
                class="text-primary-foreground pointer-events-none absolute h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        {/if}
    </div>

    {#if label || description}
        <div class="flex flex-col gap-0.5">
            {#if label}
                <label
                    for={checkboxId}
                    class="text-foreground cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {label}
                </label>
            {/if}
            {#if description}
                <p class="text-muted-foreground text-sm">{description}</p>
            {/if}
        </div>
    {/if}
</div>
