<script>
    import { cn } from '../../utils/index.js'

    /** @import { SidebarItemProps } from './types.js' */

    /** @type {SidebarItemProps} */
    let {
        label,
        icon,
        active = false,
        onclick,
        href,
        class: className,
        testId = 'sidebar-item'
    } = $props()
</script>

{#if href}
    <a
        data-testid={testId}
        {href}
        class={cn(
            'flex w-full items-center gap-2 rounded-full px-6 py-3 text-left text-sm font-medium transition-colors',
            active ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/50',
            className
        )}
        data-active={active || undefined}
    >
        {#if icon}
            <span data-testid="{testId}-icon">{@render icon()}</span>
        {/if}
        <span class="flex-1">{label}</span>
    </a>
{:else}
    <button
        data-testid={testId}
        {onclick}
        class={cn(
            'flex w-full items-center gap-2 rounded-full px-6 py-3 text-left text-sm font-medium transition-colors',
            active ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/50',
            className
        )}
        data-active={active || undefined}
    >
        {#if icon}
            <span data-testid="{testId}-icon">{@render icon()}</span>
        {/if}
        <span class="flex-1">{label}</span>
    </button>
{/if}
