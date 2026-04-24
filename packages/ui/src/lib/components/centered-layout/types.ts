import type { Snippet } from 'svelte'

/**
 * Props for the CenteredLayout component.
 */
export type CenteredLayoutProps = {
    /** The content to render inside the centered layout */
    children: Snippet
    /** Additional CSS classes */
    class?: string
    testId?: string
}
