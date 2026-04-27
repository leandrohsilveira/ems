import type { Snippet } from 'svelte'

export type ModalProps = {
    open?: boolean
    children?: Snippet
    class?: string
    testId?: string
}

export type ModalSectionProps = {
    children?: Snippet
    class?: string
    testId?: string
}
