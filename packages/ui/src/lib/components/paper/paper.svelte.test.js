import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { createRawSnippet } from 'svelte'
import Paper from './paper.svelte'

describe('Paper', () => {
    it('renders paper root element', async () => {
        const screen = render(Paper)
        const paperRoot = screen.getByTestId('paper-root')
        await expect.element(paperRoot).toBeInTheDocument()
    })

    it('renders with children content', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<div>Content</div>'
        }))
        const screen = render(Paper, { props: { children } })
        const paperContent = screen.getByTestId('paper-content')
        await expect.element(paperContent).toBeVisible()
        await expect.element(paperContent).toHaveTextContent('Content')
    })

    it('renders with header slot', async () => {
        const header = createRawSnippet(() => ({
            render: () => '<div>Header</div>'
        }))
        const screen = render(Paper, { props: { header } })
        const paperHeader = screen.getByTestId('paper-header')
        await expect.element(paperHeader).toBeVisible()
        await expect.element(paperHeader).toHaveTextContent('Header')
    })

    it('renders with footer slot', async () => {
        const footer = createRawSnippet(() => ({
            render: () => '<div>Footer</div>'
        }))
        const screen = render(Paper, { props: { footer } })
        const paperFooter = screen.getByTestId('paper-footer')
        await expect.element(paperFooter).toBeVisible()
        await expect.element(paperFooter).toHaveTextContent('Footer')
    })

    it('applies custom class', async () => {
        const screen = render(Paper, { props: { class: 'custom-class' } })
        const paperRoot = screen.getByTestId('paper-root')
        await expect.element(paperRoot).toHaveClass(/custom-class/)
    })
})
