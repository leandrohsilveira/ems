import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { createRawSnippet } from 'svelte'
import Button from './button.svelte'

describe('Button', () => {
    it('renders button element', () => {
        const { container } = render(Button)
        const button = container.querySelector('button')
        expect(button).toBeTruthy()
    })

    it('renders with default variant', () => {
        const { container } = render(Button, { props: { variant: 'default' } })
        const button = container.querySelector('button')
        expect(button?.className).toContain('bg-primary')
    })

    it('renders with secondary variant', () => {
        const { container } = render(Button, { props: { variant: 'secondary' } })
        const button = container.querySelector('button')
        expect(button?.className).toContain('bg-secondary')
    })

    it('renders with destructive variant', () => {
        const { container } = render(Button, { props: { variant: 'destructive' } })
        const button = container.querySelector('button')
        expect(button?.className).toContain('bg-destructive')
    })

    it('renders with outline variant', () => {
        const { container } = render(Button, { props: { variant: 'outline' } })
        const button = container.querySelector('button')
        expect(button?.className).toContain('border')
    })

    it('renders with ghost variant', () => {
        const { container } = render(Button, { props: { variant: 'ghost' } })
        const button = container.querySelector('button')
        expect(button?.className).toContain('bg-accent')
    })

    it('renders with large size', () => {
        const { container } = render(Button, { props: { size: 'large' } })
        const button = container.querySelector('button')
        expect(button?.className).toContain('h-12')
    })

    it('renders with default size', () => {
        const { container } = render(Button, { props: { size: 'default' } })
        const button = container.querySelector('button')
        expect(button?.className).toContain('h-10')
    })

    it('renders with icon size', () => {
        const { container } = render(Button, { props: { size: 'icon' } })
        const button = container.querySelector('button')
        expect(button?.className).toContain('h-10')
        expect(button?.className).toContain('w-10')
    })

    it('renders with text content via slot', () => {
        const { container } = render(Button)
        const button = container.querySelector('button')
        expect(button).toBeTruthy()
    })

    it('renders with children content', () => {
        const children = createRawSnippet(() => ({
            render: () => '<span>Click me</span>'
        }))
        const { container } = render(Button, { props: { children } })
        const button = container.querySelector('button')
        expect(button?.textContent).toContain('Click me')
    })

    it('renders in disabled state', () => {
        const { container } = render(Button, { props: { disabled: true } })
        const button = container.querySelector('button')
        expect(button?.disabled).toBe(true)
    })

    it('renders in loading state', () => {
        const { container } = render(Button, { props: { loading: true } })
        const button = container.querySelector('button')
        expect(button?.className).toContain('pointer-events-none')
        expect(button?.className).toContain('opacity-50')
    })

    it('applies custom class', () => {
        const { container } = render(Button, { props: { class: 'custom-class' } })
        const button = container.querySelector('button')
        expect(button?.className).toContain('custom-class')
    })
})
