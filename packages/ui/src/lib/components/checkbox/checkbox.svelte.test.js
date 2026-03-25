import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Checkbox from './checkbox.svelte'

describe('Checkbox', () => {
    it('renders checkbox element', () => {
        const { container } = render(Checkbox)
        const input = container.querySelector('input[type="checkbox"]')
        expect(input).toBeTruthy()
    })

    it('renders with label', () => {
        const { container } = render(Checkbox, { props: { label: 'Remember me' } })
        const label = container.querySelector('label')
        expect(label).toBeTruthy()
        expect(label?.textContent).toBe('Remember me')
    })

    it('renders with description', () => {
        const { container } = render(Checkbox, {
            props: { label: 'Remember me', description: 'Stay logged in' }
        })
        const description = container.querySelector('p')
        expect(description?.textContent).toBe('Stay logged in')
    })

    it('is checked when checked prop is true', () => {
        const { container } = render(Checkbox, { props: { checked: true } })
        const input = /** @type {HTMLInputElement | null} */ (
            container.querySelector('input[type="checkbox"]')
        )
        expect(input?.checked).toBe(true)
    })

    it('is unchecked when checked prop is false', () => {
        const { container } = render(Checkbox, { props: { checked: false } })
        const input = /** @type {HTMLInputElement | null} */ (
            container.querySelector('input[type="checkbox"]')
        )
        expect(input?.checked).toBe(false)
    })

    it('renders in disabled state', () => {
        const { container } = render(Checkbox, { props: { disabled: true } })
        const input = /** @type {HTMLInputElement | null} */ (
            container.querySelector('input[type="checkbox"]')
        )
        expect(input?.disabled).toBe(true)
    })

    it('applies custom class', () => {
        const { container } = render(Checkbox, { props: { class: 'custom-class' } })
        const wrapper = container.querySelector('div')
        expect(wrapper?.className).toContain('custom-class')
    })
})
