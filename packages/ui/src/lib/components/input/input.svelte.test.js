import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Input from './input.svelte'

describe('Input', () => {
    it('renders input element', async () => {
        const screen = render(Input)
        await expect.element(screen.getByRole('textbox')).toBeVisible()
    })

    it('renders with label', async () => {
        const screen = render(Input, { props: { label: 'Email' } })
        const label = screen.getByText('Email')
        await expect.element(label).toBeVisible()
    })

    it('renders with placeholder', async () => {
        const screen = render(Input, { props: { placeholder: 'Enter text...' } })
        const input = screen.getByRole('textbox')
        await expect.element(input).toHaveAttribute('placeholder', 'Enter text...')
    })

    it('renders with description', async () => {
        const screen = render(Input, {
            props: { label: 'Email', description: 'Your email address' }
        })
        const description = screen.getByText('Your email address')
        await expect.element(description).toBeVisible()
    })

    it('renders with error message', async () => {
        const screen = render(Input, { props: { label: 'Email', error: 'Invalid email' } })
        const input = screen.getByRole('textbox')
        await expect.element(input).toHaveAttribute('aria-invalid', 'true')
        const alert = screen.getByRole('alert')
        await expect.element(alert).toHaveTextContent('Invalid email')
    })

    it('renders in disabled state', async () => {
        const screen = render(Input, { props: { disabled: true } })
        const input = screen.getByRole('textbox')
        await expect.element(input).toBeDisabled()
    })

    it('applies custom class', async () => {
        const screen = render(Input, { props: { class: 'custom-class' } })
        const input = screen.getByRole('textbox')
        await expect.element(input).toHaveClass(/custom-class/)
    })
})
