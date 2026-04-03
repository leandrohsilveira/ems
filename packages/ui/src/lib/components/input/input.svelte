<script>
    import { asArray } from '@ems/utils'
    import { cn } from '../../utils/index.js'

    /** @import { InputProps } from '@ems/types-frontend-ui' */

    /** @type {InputProps} */
    let {
        label,
        description,
        error,
        disabled = false,
        class: className,
        type = 'text',
        value = $bindable(''),
        placeholder,
        id,
        ...restProps
    } = $props()

    let inputId = $derived(id ?? `input-${Math.random().toString(36).slice(2, 9)}`)
</script>

<div class="flex flex-col gap-1.5">
    {#if label}
        <label
            for={inputId}
            class="text-foreground text-sm leading-[1.4285714285714286] font-medium"
        >
            {label}
        </label>
    {/if}

    <input
        id={inputId}
        {type}
        {disabled}
        {placeholder}
        bind:value
        class={cn(
            'border-border bg-accent text-foreground w-full rounded-full border px-6 py-4.5 text-sm',
            'placeholder:text-muted-foreground',
            'focus:ring-ring focus:ring-offset-background focus:ring-2 focus:ring-offset-2 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus:ring-destructive focus:border-destructive',
            className
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={description || error ? `${inputId}-description` : undefined}
        {...restProps}
    />

    {#if description && !error}
        <p id="{inputId}-description" class="text-muted-foreground text-sm">
            {description}
        </p>
    {/if}

    {#if error}
        {#each asArray(error) as err (err)}
            <p id="{inputId}-description" class="text-destructive text-sm" role="alert">
                {err}
            </p>
        {/each}
    {/if}
</div>
