import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Input from './input.svelte'

describe('Input', () => {
    it('renders input element', () => {
        const { container } = render(Input)
        const input = container.querySelector('input')
        expect(input).toBeTruthy()
    })

    it('renders with label', () => {
        const { container } = render(Input, { props: { label: 'Email' } })
        const label = container.querySelector('label')
        expect(label).toBeTruthy()
        expect(label?.textContent).toBe('Email')
    })

    it('renders with placeholder', () => {
        const { container } = render(Input, { props: { placeholder: 'Enter text...' } })
        const input = container.querySelector('input')
        expect(input?.placeholder).toBe('Enter text...')
    })

    it('renders with description', () => {
        const { container } = render(Input, {
            props: { label: 'Email', description: 'Your email address' }
        })
        const description = container.querySelector('p')
        expect(description?.textContent).toBe('Your email address')
    })

    it('renders with error message', () => {
        const { container } = render(Input, { props: { label: 'Email', error: 'Invalid email' } })
        const input = container.querySelector('input')
        expect(input?.getAttribute('aria-invalid')).toBe('true')
        const alert = container.querySelector('[role="alert"]')
        expect(alert?.textContent).toBe('Invalid email')
    })

    it('renders in disabled state', () => {
        const { container } = render(Input, { props: { disabled: true } })
        const input = container.querySelector('input')
        expect(input?.disabled).toBe(true)
    })

    it('applies custom class', () => {
        const { container } = render(Input, { props: { class: 'custom-class' } })
        const input = container.querySelector('input')
        expect(input?.className).toContain('custom-class')
    })
})
