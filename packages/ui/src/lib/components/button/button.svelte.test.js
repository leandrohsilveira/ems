import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { createRawSnippet } from 'svelte'
import Button from './button.svelte'

describe('Button', () => {
    it('renders button element', async () => {
        const screen = render(Button)
        await expect.element(screen.getByRole('button')).toBeVisible()
    })

    it('renders with default variant', async () => {
        const screen = render(Button, { props: { variant: 'default' } })
        const button = screen.getByRole('button')
        await expect.element(button).toHaveClass(/bg-primary/)
    })

    it('renders with secondary variant', async () => {
        const screen = render(Button, { props: { variant: 'secondary' } })
        const button = screen.getByRole('button')
        await expect.element(button).toHaveClass(/bg-secondary/)
    })

    it('renders with destructive variant', async () => {
        const screen = render(Button, { props: { variant: 'destructive' } })
        const button = screen.getByRole('button')
        await expect.element(button).toHaveClass(/bg-destructive/)
    })

    it('renders with outline variant', async () => {
        const screen = render(Button, { props: { variant: 'outline' } })
        const button = screen.getByRole('button')
        await expect.element(button).toHaveClass(/border/)
    })

    it('renders with ghost variant', async () => {
        const screen = render(Button, { props: { variant: 'ghost' } })
        const button = screen.getByRole('button')
        await expect.element(button).toHaveClass(/bg-accent/)
    })

    it('renders with large size', async () => {
        const screen = render(Button, { props: { size: 'large' } })
        const button = screen.getByRole('button')
        await expect.element(button).toHaveClass(/h-12/)
    })

    it('renders with default size', async () => {
        const screen = render(Button, { props: { size: 'default' } })
        const button = screen.getByRole('button')
        await expect.element(button).toHaveClass(/h-10/)
    })

    it('renders with icon size', async () => {
        const screen = render(Button, { props: { size: 'icon' } })
        const button = screen.getByRole('button')
        await expect.element(button).toHaveClass(/h-10/)
        await expect.element(button).toHaveClass(/w-10/)
    })

    it('renders with text content via slot', async () => {
        const screen = render(Button)
        await expect.element(screen.getByRole('button')).toBeVisible()
    })

    it('renders with children content', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<span>Click me</span>'
        }))
        const screen = render(Button, { props: { children } })
        const button = screen.getByRole('button')
        await expect.element(button).toHaveTextContent(/Click me/)
    })

    it('renders in disabled state', async () => {
        const screen = render(Button, { props: { disabled: true } })
        const button = screen.getByRole('button')
        await expect.element(button).toBeDisabled()
    })

    it('renders in loading state', async () => {
        const screen = render(Button, { props: { loading: true } })
        const button = screen.getByRole('button')
        await expect.element(button).toHaveClass(/pointer-events-none/)
        await expect.element(button).toHaveClass(/opacity-50/)
    })

    it('applies custom class', async () => {
        const screen = render(Button, { props: { class: 'custom-class' } })
        const button = screen.getByRole('button')
        await expect.element(button).toHaveClass(/custom-class/)
    })

    describe('anchor element', () => {
        it('renders as anchor with href', async () => {
            const screen = render(Button, { props: { element: 'a', href: '/test-path' } })
            const anchor = screen.getByRole('button')
            const element = anchor.element()

            expect(element.tagName).toBe('A')
            await expect.element(anchor).toHaveAttribute('href', '/test-path')
        })

        it('omits href when disabled', async () => {
            const screen = render(Button, {
                props: { element: 'a', href: '/test-path', disabled: true }
            })
            const anchor = screen.getByRole('button')
            const element = anchor.element()

            expect(element.tagName).toBe('A')
            await expect.element(anchor).not.toHaveAttribute('href')
            await expect.element(anchor).toHaveAttribute('aria-disabled', 'true')
        })

        it('omits href when loading', async () => {
            const screen = render(Button, {
                props: { element: 'a', href: '/test-path', loading: true }
            })
            const anchor = screen.getByRole('button')
            const element = anchor.element()

            expect(element.tagName).toBe('A')
            await expect.element(anchor).not.toHaveAttribute('href')
            await expect.element(anchor).toHaveAttribute('aria-disabled', 'true')
        })
    })
})
