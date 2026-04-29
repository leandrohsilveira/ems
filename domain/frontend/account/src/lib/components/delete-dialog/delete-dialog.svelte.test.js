import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { createEnhanceMock } from '@ems/ui/testing'
import DeleteDialog from './delete-dialog.svelte'
import { deleteDialogI18n } from './delete-dialog.i18n.js'
import { resolve } from '@ems/i18n'

const literals = resolve('en', deleteDialogI18n)

describe('DeleteDialog', () => {
    it('does not render when open is false', async () => {
        const screen = render(DeleteDialog, {
            props: {
                open: false,
                accountName: 'Nubank Checking',
                literals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect.element(screen.getByTestId('modal')).not.toBeInTheDocument()
    })

    it('renders when open is true', async () => {
        const screen = render(DeleteDialog, {
            props: {
                open: true,
                accountName: 'Nubank Checking',
                literals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect.element(screen.getByRole('dialog')).toBeVisible()
    })

    it('shows account name in description', async () => {
        const screen = render(DeleteDialog, {
            props: {
                open: true,
                accountName: 'Nubank Checking',
                literals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect.element(screen.getByText(/Nubank Checking/)).toBeVisible()
    })

    it('shows delete and cancel buttons', async () => {
        const screen = render(DeleteDialog, {
            props: {
                open: true,
                accountName: 'Test Account',
                literals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect.element(screen.getByLabelText(literals.cancelButton)).toBeVisible()
        await expect.element(screen.getByLabelText(literals.deleteButton)).toBeVisible()
        await expect.element(screen.getByLabelText(literals.cancelButton)).not.toBeDisabled()
        await expect.element(screen.getByLabelText(literals.deleteButton)).not.toBeDisabled()
    })

    it('shows error message when provided', async () => {
        const screen = render(DeleteDialog, {
            props: {
                open: true,
                accountName: 'Test Account',
                literals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts',
                errorMessage: 'Cannot delete account'
            }
        })

        await expect.element(screen.getByText('Cannot delete account')).toBeVisible()
    })

    it('disables buttons when loading', async () => {
        const screen = render(DeleteDialog, {
            props: {
                open: true,
                accountName: 'Test Account',
                literals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts',
                loading: true
            }
        })

        await expect.element(screen.getByLabelText(literals.cancelButton)).toBeVisible()
        await expect.element(screen.getByLabelText(literals.deleteButton)).toBeVisible()
        await expect.element(screen.getByLabelText(literals.cancelButton)).toBeDisabled()
        await expect.element(screen.getByLabelText(literals.deleteButton)).toBeDisabled()
    })
})
