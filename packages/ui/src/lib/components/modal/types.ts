import type { Snippet } from 'svelte'

export type ModalProps = {
    open?: boolean
    children?: Snippet
    class?: string
    overlayClass?: string
    testId?: string
    tabindex?: number | null | undefined
    label?: string
    onclose?: () => void
}

export type ModalSectionProps = {
    children?: Snippet
    class?: string
    testId?: string
}
