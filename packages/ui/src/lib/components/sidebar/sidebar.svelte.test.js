import { describe, it, expect, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { createRawSnippet } from 'svelte'
import Sidebar from './sidebar.svelte'
import SidebarHeader from './sidebar-header.svelte'
import SidebarContent from './sidebar-content.svelte'
import SidebarFooter from './sidebar-footer.svelte'
import SidebarItem from './sidebar-item.svelte'

describe('Sidebar', () => {
    it('renders sidebar root element', async () => {
        const screen = render(Sidebar)
        const sidebar = screen.getByTestId('sidebar-root')
        await expect.element(sidebar).toBeInTheDocument()
    })

    it('applies custom class', async () => {
        const screen = render(Sidebar, { props: { class: 'custom-class' } })
        const sidebar = screen.getByTestId('sidebar-root')
        await expect.element(sidebar).toHaveClass(/custom-class/)
    })

    it('applies custom testId', async () => {
        const screen = render(Sidebar, { props: { testId: 'custom-sidebar' } })
        const sidebar = screen.getByTestId('custom-sidebar-root')
        await expect.element(sidebar).toBeInTheDocument()
    })
})

describe('SidebarHeader', () => {
    it('renders header content', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<span>Logo</span>'
        }))
        const screen = render(SidebarHeader, { props: { children } })
        const header = screen.getByTestId('sidebar-header')
        await expect.element(header).toBeVisible()
        await expect.element(header).toHaveTextContent('Logo')
    })

    it('applies custom class', async () => {
        const screen = render(SidebarHeader, { props: { class: 'p-6' } })
        const header = screen.getByTestId('sidebar-header')
        await expect.element(header).toHaveClass(/p-6/)
    })
})

describe('SidebarContent', () => {
    it('renders content with nav', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<span>Nav items</span>'
        }))
        const screen = render(SidebarContent, { props: { children } })
        const content = screen.getByTestId('sidebar-content')
        await expect.element(content).toBeVisible()
        await expect.element(content).toHaveTextContent('Nav items')
    })

    it('applies custom class', async () => {
        const screen = render(SidebarContent, { props: { class: 'px-4' } })
        const content = screen.getByTestId('sidebar-content')
        await expect.element(content).toHaveClass(/px-4/)
    })
})

describe('SidebarFooter', () => {
    it('renders footer content', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<span>User Info</span>'
        }))
        const screen = render(SidebarFooter, { props: { children } })
        const footer = screen.getByTestId('sidebar-footer')
        await expect.element(footer).toBeVisible()
        await expect.element(footer).toHaveTextContent('User Info')
    })

    it('applies custom class', async () => {
        const screen = render(SidebarFooter, { props: { class: 'p-4' } })
        const footer = screen.getByTestId('sidebar-footer')
        await expect.element(footer).toHaveClass(/p-4/)
    })
})

describe('SidebarItem', () => {
    it('renders as button with label', async () => {
        const screen = render(SidebarItem, { props: { label: 'Dashboard' } })
        const item = screen.getByTestId('sidebar-item')
        await expect.element(item).toBeInTheDocument()
        await expect.element(item).toHaveTextContent('Dashboard')
    })

    it('renders as anchor when href is provided', async () => {
        const screen = render(SidebarItem, { props: { label: 'Dashboard', href: '/dashboard' } })
        const item = screen.getByTestId('sidebar-item')
        await expect.element(item).toHaveTextContent('Dashboard')
    })

    it('renders active state with correct data attribute', async () => {
        const screen = render(SidebarItem, { props: { label: 'Accounts', active: true } })
        const item = screen.getByTestId('sidebar-item')
        await expect.element(item).toHaveAttribute('data-active')
    })

    it('renders without active data attribute when not active', async () => {
        const screen = render(SidebarItem, { props: { label: 'Dashboard', active: false } })
        const item = screen.getByTestId('sidebar-item')
        await expect.element(item).not.toHaveAttribute('data-active')
    })

    it('calls onclick when clicked', async () => {
        const spy = vi.fn()
        const screen = render(SidebarItem, { props: { label: 'Dashboard', onclick: spy } })
        const item = screen.getByTestId('sidebar-item')
        await item.click()
        expect(spy).toHaveBeenCalledOnce()
    })

    it('renders icon content', async () => {
        const icon = createRawSnippet(() => ({
            render: () => '<span>icon</span>'
        }))
        const screen = render(SidebarItem, { props: { label: 'Dashboard', icon } })
        const itemIcon = screen.getByTestId('sidebar-item-icon')
        await expect.element(itemIcon).toBeVisible()
    })

    it('applies custom class', async () => {
        const screen = render(SidebarItem, { props: { label: 'Dashboard', class: 'custom-class' } })
        const item = screen.getByTestId('sidebar-item')
        await expect.element(item).toHaveClass(/custom-class/)
    })

    it('applies custom testId', async () => {
        const screen = render(SidebarItem, { props: { label: 'Dashboard', testId: 'my-item' } })
        const item = screen.getByTestId('my-item')
        await expect.element(item).toBeInTheDocument()
    })
})
