<script>
    import { cn } from '../../utils/index.js'

    /** @import { ButtonProps } from './types.js' */

    /** @type {ButtonProps} */
    let {
        variant = 'default',
        size = 'default',
        loading = false,
        disabled = false,
        class: className,
        type = 'button',
        children,
        ...restProps
    } = $props()

    const variantClasses = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'bg-accent hover:bg-accent/80'
    }

    const sizeClasses = {
        default: 'h-10 px-4 py-2',
        large: 'h-12 px-6 py-3',
        icon: 'h-10 w-10'
    }
</script>

<button
    {type}
    disabled={disabled || loading}
    class={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        { 'pointer-events-none opacity-50': loading },
        className
    )}
    {...restProps}
>
    {#if loading}
        <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        ></span>
    {/if}
    {@render children?.()}
</button>
