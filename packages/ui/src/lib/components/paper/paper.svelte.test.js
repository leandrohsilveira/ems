import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { createRawSnippet } from 'svelte'
import Paper from './paper.svelte'

describe('Paper', () => {
    it('renders div element', () => {
        const { container } = render(Paper)
        const div = container.querySelector('div')
        expect(div).toBeTruthy()
    })

    it('renders with children content', () => {
        const children = createRawSnippet(() => ({
            render: () => 'Content'
        }))
        const { container } = render(Paper, { props: { children } })
        const childrenDiv = container.querySelector('.pt-0')
        expect(childrenDiv?.textContent).toBe('Content')
    })

    it('renders with header slot', () => {
        const header = createRawSnippet(() => ({
            render: () => 'Header'
        }))
        const { container } = render(Paper, { props: { header } })
        const headerEl = container.querySelector('[data-header]')
        expect(headerEl?.textContent).toBe('Header')
    })

    it('renders with footer slot', () => {
        const footer = createRawSnippet(() => ({
            render: () => 'Footer'
        }))
        const { container } = render(Paper, { props: { footer } })
        const footerEl = container.querySelector('[data-footer]')
        expect(footerEl?.textContent).toBe('Footer')
    })

    it('applies custom class', () => {
        const { container } = render(Paper, { props: { class: 'custom-class' } })
        const div = container.querySelector('div')
        expect(div?.className).toContain('custom-class')
    })
})
