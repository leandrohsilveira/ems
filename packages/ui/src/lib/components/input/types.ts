import type { HTMLInputAttributes } from 'svelte/elements'

/**
 * Props for the Input component.
 * Extends HTMLInputAttributes with additional custom props.
 */
export type InputProps = HTMLInputAttributes & {
    /** Label text displayed above the input */
    label?: string
    /** Helper text displayed below the input */
    description?: string
    /** Error message to display (shows destructive styling) */
    error?: string | string[] | undefined
}
