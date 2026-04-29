import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { createEnhanceMock } from '@ems/ui/testing'
import AccountFormModal from './account-form-modal.svelte'
import { createAccountFormModalI18n, editAccountFormModalI18n } from './account-form-modal.i18n.js'
import { resolve } from '@ems/i18n'
import { AccountType } from '@ems/domain-shared-account'

const createAccountLiterals = resolve('en', createAccountFormModalI18n)
const editAccountLiterals = resolve('en', editAccountFormModalI18n)

const mockAccount = {
    id: '1',
    userId: 'user-1',
    name: 'Nubank Checking',
    type: AccountType.BANK,
    currency: 'BRL',
    balance: '1000',
    createdAt: '2026-04-25T00:00:00Z',
    updatedAt: '2026-04-25T00:00:00Z'
}

describe('AccountFormModal', () => {
    it('does not render when open is false', async () => {
        const screen = render(AccountFormModal, {
            props: {
                open: false,
                mode: 'create',
                literals: createAccountLiterals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect.element(screen.getByTestId('modal')).not.toBeInTheDocument()
    })

    it('renders when open is true', async () => {
        const screen = render(AccountFormModal, {
            props: {
                open: true,
                mode: 'create',
                literals: createAccountLiterals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect.element(screen.getByRole('dialog')).toBeVisible()
    })

    it('shows create mode title', async () => {
        const screen = render(AccountFormModal, {
            props: {
                open: true,
                mode: 'create',
                literals: createAccountLiterals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect
            .element(screen.getByRole('heading', { hasText: 'Create Account' }))
            .toBeVisible()
        await expect
            .element(screen.getByText('Add a new bank account to your ledger'))
            .toBeVisible()
    })

    it('shows edit mode title', async () => {
        const screen = render(AccountFormModal, {
            props: {
                open: true,
                mode: 'edit',
                account: mockAccount,
                literals: editAccountLiterals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect.element(screen.getByRole('heading', { hasText: 'Edit Account' })).toBeVisible()
        await expect.element(screen.getByText('Update your bank account details')).toBeVisible()
    })

    it('shows name input field', async () => {
        const screen = render(AccountFormModal, {
            props: {
                open: true,
                mode: 'create',
                literals: createAccountLiterals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect.element(screen.getByLabelText('Account Name')).toBeVisible()
    })

    it('shows initial balance field in create mode', async () => {
        const screen = render(AccountFormModal, {
            props: {
                open: true,
                mode: 'create',
                literals: createAccountLiterals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect.element(screen.getByLabelText('Initial Balance')).toBeVisible()
    })

    it('hides initial balance field in edit mode', async () => {
        const screen = render(AccountFormModal, {
            props: {
                open: true,
                mode: 'edit',
                account: mockAccount,
                literals: editAccountLiterals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect.element(screen.getByLabelText('Initial Balance')).not.toBeInTheDocument()
    })

    it('shows create button text in create mode', async () => {
        const screen = render(AccountFormModal, {
            props: {
                open: true,
                mode: 'create',
                literals: createAccountLiterals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect
            .element(screen.getByLabelText(createAccountLiterals.submitButton))
            .toBeVisible()
    })

    it('shows save button text in edit mode', async () => {
        const screen = render(AccountFormModal, {
            props: {
                open: true,
                mode: 'edit',
                account: mockAccount,
                literals: editAccountLiterals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect.element(screen.getByLabelText(editAccountLiterals.submitButton)).toBeVisible()
    })

    it('shows cancel button', async () => {
        const screen = render(AccountFormModal, {
            props: {
                open: true,
                mode: 'create',
                literals: createAccountLiterals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts'
            }
        })

        await expect
            .element(screen.getByLabelText(createAccountLiterals.cancelButton))
            .toBeVisible()
    })

    it('shows error message when provided', async () => {
        const screen = render(AccountFormModal, {
            props: {
                open: true,
                mode: 'create',
                literals: createAccountLiterals,
                enhance: createEnhanceMock(),
                cancelHref: '/accounts',
                errorMessage: 'Something went wrong'
            }
        })

        await expect.element(screen.getByText('Something went wrong')).toBeVisible()
    })
})
