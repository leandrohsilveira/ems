import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { createRawSnippet } from 'svelte'
import CenteredLayout from './centered-layout.svelte'

describe('CenteredLayout', () => {
    const children = createRawSnippet(() => ({
        render: () => '<div>Child Content</div>'
    }))

    it('renders centered layout element', async () => {
        const screen = render(CenteredLayout, { props: { children } })
        const layout = screen.getByTestId('centered-layout')
        await expect.element(layout).toBeInTheDocument()
    })

    it('renders with children content', async () => {
        const screen = render(CenteredLayout, { props: { children } })
        const layout = screen.getByTestId('centered-layout')
        await expect.element(layout).toHaveTextContent('Child Content')
    })

    it('applies custom class', async () => {
        const screen = render(CenteredLayout, { props: { class: 'custom-class', children } })
        const layout = screen.getByTestId('centered-layout')
        await expect.element(layout).toHaveClass(/custom-class/)
    })

    it('applies default layout classes', async () => {
        const screen = render(CenteredLayout, { props: { children } })
        const layout = screen.getByTestId('centered-layout')
        await expect.element(layout).toHaveClass(/flex/)
        await expect.element(layout).toHaveClass(/min-h-screen/)
        await expect.element(layout).toHaveClass(/items-center/)
        await expect.element(layout).toHaveClass(/justify-center/)
        await expect.element(layout).toHaveClass(/p-4/)
    })

    it('accepts custom testId', async () => {
        const screen = render(CenteredLayout, { props: { testId: 'my-layout', children } })
        const layout = screen.getByTestId('my-layout')
        await expect.element(layout).toBeInTheDocument()
    })
})
