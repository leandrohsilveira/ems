import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { createRawSnippet } from 'svelte'
import Modal from './modal.svelte'
import ModalHeader from './modal-header.svelte'
import ModalContent from './modal-content.svelte'
import ModalActions from './modal-actions.svelte'

describe('Modal', () => {
    it('does not render when open is false', async () => {
        const { container } = render(Modal, { props: { open: false } })
        expect(container.querySelector('[data-testid="modal"]')).toBeNull()
    })

    it('renders when open is true', async () => {
        const screen = render(Modal, { props: { open: true } })
        const modal = screen.getByTestId('modal')
        await expect.element(modal).toBeInTheDocument()
    })

    it('renders with aria-modal role', async () => {
        const screen = render(Modal, { props: { open: true } })
        const modal = screen.getByTestId('modal')
        await expect.element(modal).toHaveAttribute('role', 'dialog')
        await expect.element(modal).toHaveAttribute('aria-modal', 'true')
    })

    it('renders overlay container', async () => {
        const screen = render(Modal, { props: { open: true } })
        const container = screen.getByTestId('modal-container')
        await expect.element(container).toBeInTheDocument()
    })

    it('applies custom class', async () => {
        const screen = render(Modal, { props: { open: true, class: 'custom-class' } })
        const modal = screen.getByTestId('modal')
        await expect.element(modal).toHaveClass(/custom-class/)
    })

    it('applies custom testId', async () => {
        const screen = render(Modal, { props: { open: true, testId: 'custom-modal' } })
        const modal = screen.getByTestId('custom-modal')
        await expect.element(modal).toBeInTheDocument()
    })
})

describe('ModalHeader', () => {
    it('renders header with content', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<h2>Title</h2>'
        }))
        const screen = render(ModalHeader, { props: { children } })
        const header = screen.getByTestId('modal-header')
        await expect.element(header).toBeVisible()
        await expect.element(header).toHaveTextContent('Title')
    })

    it('applies custom class', async () => {
        const screen = render(ModalHeader, { props: { class: 'custom-padding' } })
        const header = screen.getByTestId('modal-header')
        await expect.element(header).toHaveClass(/custom-padding/)
    })
})

describe('ModalContent', () => {
    it('renders content with children', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<p>Body</p>'
        }))
        const screen = render(ModalContent, { props: { children } })
        const content = screen.getByTestId('modal-content')
        await expect.element(content).toBeVisible()
        await expect.element(content).toHaveTextContent('Body')
    })

    it('applies custom class', async () => {
        const screen = render(ModalContent, { props: { class: 'p-4' } })
        const content = screen.getByTestId('modal-content')
        await expect.element(content).toHaveClass(/p-4/)
    })
})

describe('ModalActions', () => {
    it('renders actions with children', async () => {
        const children = createRawSnippet(() => ({
            render: () => '<button>Save</button>'
        }))
        const screen = render(ModalActions, { props: { children } })
        const actions = screen.getByTestId('modal-actions')
        await expect.element(actions).toBeVisible()
        await expect.element(actions).toHaveTextContent('Save')
    })

    it('applies custom class', async () => {
        const screen = render(ModalActions, { props: { class: 'flex-col-reverse' } })
        const actions = screen.getByTestId('modal-actions')
        await expect.element(actions).toHaveClass(/flex-col-reverse/)
    })
})
