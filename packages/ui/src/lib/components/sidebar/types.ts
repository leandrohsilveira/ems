import type { Snippet } from 'svelte'

export type SidebarProps = {
    children?: Snippet
    class?: string
    testId?: string
}

export type SidebarSectionProps = {
    children?: Snippet
    class?: string
    testId?: string
}

export type SidebarItemProps = {
    label: string
    icon?: Snippet
    active?: boolean
    onclick?: () => void
    href?: string
    class?: string
    testId?: string
}
