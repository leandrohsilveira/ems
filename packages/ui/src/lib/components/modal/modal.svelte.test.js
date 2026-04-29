import { describe, it, expect, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { userEvent, page } from 'vitest/browser'
import { createRawSnippet } from 'svelte'
import Modal from './modal.svelte'
import ModalHeader from './modal-header.svelte'
import ModalContent from './modal-content.svelte'
import ModalActions from './modal-actions.svelte'

describe('Modal', () => {
    const label = 'Testing modal'

    const children = createRawSnippet(() => ({
        render: () => '<div>Modal Content</div>'
    }))

    it('does not render when open is false', async () => {
        const screen = render(Modal, { props: { open: false, children, label } })
        const modal = screen.getByRole('dialog')
        await expect.element(modal).not.toBeInTheDocument()
    })

    it('renders when open is true', async () => {
        const screen = render(Modal, { props: { open: true, children, label } })
        const modal = screen.getByRole('dialog')
        await expect.element(modal).toBeVisible()
    })

    it('renders with aria-modal role', async () => {
        const screen = render(Modal, { props: { open: true, children, label } })
        const modal = screen.getByRole('dialog')
        await expect.element(modal).toHaveAttribute('aria-modal', 'true')
    })

    it('renders overlay', async () => {
        const screen = render(Modal, { props: { open: true, children, label } })
        const container = screen.getByTestId('modal-overlay')
        await expect.element(container).toBeVisible()
    })

    it('applies custom class', async () => {
        const screen = render(Modal, {
            props: { open: true, class: 'custom-class', children, label }
        })
        const modal = screen.getByRole('dialog')
        await expect.element(modal).toHaveClass(/custom-class/)
    })

    it('applies custom testId', async () => {
        const screen = render(Modal, {
            props: { open: true, testId: 'custom-modal', children, label }
        })
        await expect.element(screen.getByTestId('custom-modal-overlay')).toBeVisible()
        await expect.element(screen.getByTestId('custom-modal-container')).toBeVisible()
    })

    it('closes and calls onclose when overlay is clicked', async () => {
        const onclose = vi.fn()
        const screen = render(Modal, { props: { open: true, onclose, children, label } })

        await page.viewport(1024, 768)

        const overlay = screen.getByTestId('modal-overlay')

        await expect.element(overlay).toBeVisible()

        await overlay.click({ button: 'left', position: { x: 3, y: 3 } })

        expect(onclose).toHaveBeenCalledTimes(1)
        await expect.element(overlay).not.toBeInTheDocument()
    })

    it('does not close or call onclose when modal container is clicked', async () => {
        const onclose = vi.fn()
        const screen = render(Modal, { props: { open: true, onclose, children, label } })

        const container = screen.getByRole('dialog')

        await container.click()

        expect(onclose).not.toHaveBeenCalled()
        await expect.element(screen.getByTestId('modal-overlay')).toBeVisible()
    })

    it('closes and calls onclose when Escape key is pressed', async () => {
        const onclose = vi.fn()
        const screen = render(Modal, {
            props: { open: true, onclose, children, label }
        })
        const modal = screen.getByRole('dialog')

        await expect.element(modal).toBeVisible()

        await modal.click()

        await userEvent.keyboard('{Escape}')

        expect(onclose).toHaveBeenCalledTimes(1)
        await expect.element(modal).not.toBeInTheDocument()
    })

    it('does not close or call onclose for non-Escape key presses', async () => {
        const onclose = vi.fn()
        const screen = render(Modal, {
            props: { open: true, onclose, children, label }
        })

        const modal = screen.getByRole('dialog')

        await expect.element(modal).toBeVisible()

        await modal.click()

        await userEvent.keyboard('{Enter}')
        await userEvent.keyboard('{Tab}')

        expect(onclose).not.toHaveBeenCalled()
        await expect.element(modal).toBeVisible()
    })

    it('applies custom tabindex', async () => {
        const screen = render(Modal, {
            props: { open: true, tabindex: 5, children, label }
        })
        const modal = screen.getByRole('dialog')

        await expect.element(modal).toHaveAttribute('tabindex', '5')
    })

    it('renders with default tabindex of 0', async () => {
        const screen = render(Modal, { props: { open: true, children, label } })
        const modal = screen.getByRole('dialog')

        await expect.element(modal).toHaveAttribute('tabindex', '0')
    })

    describe('focus trap', () => {
        const focusableChildren = createRawSnippet(() => ({
            render: () =>
                '<div><button data-testid="btn-first">First</button><button data-testid="btn-last">Last</button></div>'
        }))

        it('focuses the dialog container when opened', async () => {
            const screen = render(Modal, {
                props: { open: true, children: focusableChildren, label }
            })
            const dialog = screen.getByRole('dialog')

            await expect.element(dialog).toHaveFocus()
        })

        it('moves focus to first focusable child on Tab', async () => {
            const screen = render(Modal, {
                props: { open: true, children: focusableChildren, label }
            })
            const dialog = screen.getByRole('dialog')

            await expect.element(dialog).toHaveFocus()

            await userEvent.keyboard('{Tab}')

            const firstButton = screen.getByTestId('btn-first')
            await expect.element(firstButton).toHaveFocus()
        })

        it('traps focus when pressing Shift+Tab on the dialog', async () => {
            const screen = render(Modal, {
                props: { open: true, children: focusableChildren, label }
            })
            const dialog = screen.getByRole('dialog')

            await expect.element(dialog).toHaveFocus()

            await userEvent.keyboard('{Shift>}{Tab}{/Shift}')

            await expect.element(dialog).toHaveFocus()
        })
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
