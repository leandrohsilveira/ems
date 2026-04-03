import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Checkbox from './checkbox.svelte'

describe('Checkbox', () => {
    it('renders checkbox element', async () => {
        const screen = render(Checkbox)
        await expect.element(screen.getByRole('checkbox')).toBeVisible()
    })

    it('renders with label', async () => {
        const screen = render(Checkbox, { props: { label: 'Remember me' } })
        const label = screen.getByText('Remember me')
        await expect.element(label).toBeVisible()
    })

    it('renders with description', async () => {
        const screen = render(Checkbox, {
            props: { label: 'Remember me', description: 'Stay logged in' }
        })
        const description = screen.getByText('Stay logged in')
        await expect.element(description).toBeVisible()
    })

    it('is checked when checked prop is true', async () => {
        const screen = render(Checkbox, { props: { checked: true } })
        const checkbox = screen.getByRole('checkbox')
        await expect.element(checkbox).toBeChecked()
    })

    it('is unchecked when checked prop is false', async () => {
        const screen = render(Checkbox, { props: { checked: false } })
        const checkbox = screen.getByRole('checkbox')
        await expect.element(checkbox).not.toBeChecked()
    })

    it('renders in disabled state', async () => {
        const screen = render(Checkbox, { props: { disabled: true } })
        const checkbox = screen.getByRole('checkbox')
        await expect.element(checkbox).toBeDisabled()
    })

    it('applies custom class', async () => {
        const screen = render(Checkbox, { props: { class: 'custom-class' } })
        const checkboxWrapper = screen.getByTestId('checkbox-wrapper')
        await expect.element(checkboxWrapper).toHaveClass(/custom-class/)
    })
})
