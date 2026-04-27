import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { createRawSnippet } from 'svelte'
import Paper from './paper.svelte'
import PaperHeader from './paper-header.svelte'
import PaperContent from './paper-content.svelte'
import PaperFooter from './paper-footer.svelte'

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
        const paperRoot = screen.getByTestId('paper-root')
        await expect.element(paperRoot).toHaveTextContent('Content')
    })

    it('applies custom class', async () => {
        const screen = render(Paper, { props: { class: 'custom-class' } })
        const paperRoot = screen.getByTestId('paper-root')
        await expect.element(paperRoot).toHaveClass(/custom-class/)
    })

    it('renders with custom element', async () => {
        const screen = render(Paper, { props: { element: 'section' } })
        const paperRoot = screen.getByTestId('paper-root')
        await expect.element(paperRoot).toBeInTheDocument()
    })
})

describe('PaperHeader', () => {
    it('renders header with content', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<h2>Title</h2>'
        }))
        const screen = render(PaperHeader, { props: { children } })
        const header = screen.getByTestId('paper-header')
        await expect.element(header).toBeVisible()
        await expect.element(header).toHaveTextContent('Title')
    })

    it('applies custom class', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<span>content</span>'
        }))
        const screen = render(PaperHeader, { props: { children, class: 'p-10' } })
        const header = screen.getByTestId('paper-header')
        await expect.element(header).toHaveClass(/p-10/)
    })
})

describe('PaperContent', () => {
    it('renders content with children', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<p>Body</p>'
        }))
        const screen = render(PaperContent, { props: { children } })
        const content = screen.getByTestId('paper-content')
        await expect.element(content).toBeVisible()
        await expect.element(content).toHaveTextContent('Body')
    })

    it('applies custom class', async () => {
        const screen = render(PaperContent, { props: { class: 'p-4' } })
        const content = screen.getByTestId('paper-content')
        await expect.element(content).toHaveClass(/p-4/)
    })
})

describe('PaperFooter', () => {
    it('renders footer with content', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<button>Action</button>'
        }))
        const screen = render(PaperFooter, { props: { children } })
        const footer = screen.getByTestId('paper-footer')
        await expect.element(footer).toBeVisible()
        await expect.element(footer).toHaveTextContent('Action')
    })

    it('applies custom class', async () => {
        const screen = render(PaperFooter, { props: { class: 'flex gap-2' } })
        const footer = screen.getByTestId('paper-footer')
        await expect.element(footer).toHaveClass(/flex/)
    })
})
