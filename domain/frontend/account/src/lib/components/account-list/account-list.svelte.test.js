import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import AccountList from './account-list.svelte'
import { accountListI18n } from './account-list.i18n.js'
import { resolve } from '@ems/i18n'
import { AccountType } from '@ems/domain-shared-account'

const literals = resolve('en', accountListI18n)

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

describe('AccountList', () => {
    it('shows loading skeleton when loading is true', async () => {
        const screen = render(AccountList, {
            props: {
                accounts: [],
                literals,
                loading: true,
                createHref: '/accounts/new',
                editHref: '/accounts/{id}/edit',
                deleteHref: '/accounts/{id}/delete'
            }
        })

        await expect.element(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    it('shows empty state when no accounts and not loading', async () => {
        const screen = render(AccountList, {
            props: {
                accounts: [],
                literals,
                loading: false,
                createHref: '/accounts/new',
                editHref: '/accounts/{id}/edit',
                deleteHref: '/accounts/{id}/delete'
            }
        })

        await expect.element(screen.getByText('No accounts yet')).toBeVisible()
        await expect
            .element(screen.getByText('Create your first account to start tracking your finances.'))
            .toBeVisible()
    })

    it('renders new account button in empty state', async () => {
        const screen = render(AccountList, {
            props: {
                accounts: [],
                literals,
                loading: false,
                createHref: '/accounts/new',
                editHref: '/accounts/{id}/edit',
                deleteHref: '/accounts/{id}/delete'
            }
        })

        const button = screen.getByRole('button', { name: /new account/i })
        await expect.element(button).toBeVisible()
        await expect.element(button).toHaveAttribute('href', '/accounts/new')
    })

    it('renders account card when accounts are provided', async () => {
        const screen = render(AccountList, {
            props: {
                accounts: [mockAccount],
                literals,
                loading: false,
                createHref: '/accounts/new',
                editHref: '/accounts/{id}/edit',
                deleteHref: '/accounts/{id}/delete'
            }
        })

        await expect.element(screen.getByTestId('account-card')).toBeVisible()
        await expect.element(screen.getByText('Nubank Checking')).toBeVisible()
    })

    it('renders multiple account cards', async () => {
        const account2 = { ...mockAccount, id: '2', name: 'Savings Account' }
        const screen = render(AccountList, {
            props: {
                accounts: [mockAccount, account2],
                literals,
                loading: false,
                createHref: '/accounts/new',
                editHref: '/accounts/{id}/edit',
                deleteHref: '/accounts/{id}/delete'
            }
        })

        const cards = screen.getByTestId('account-card')
        expect(cards.all()).toHaveLength(2)
        await expect.element(screen.getByText('Nubank Checking')).toBeVisible()
        await expect.element(screen.getByText('Savings Account')).toBeVisible()
    })

    it('edit link has correct href', async () => {
        const screen = render(AccountList, {
            props: {
                accounts: [mockAccount],
                literals,
                loading: false,
                createHref: '/accounts/new',
                editHref: '/accounts/{id}/edit',
                deleteHref: '/accounts/{id}/delete'
            }
        })

        const editLink = screen.getByTestId('edit-button')
        await expect.element(editLink).toHaveAttribute('href', '/accounts/1/edit')
    })

    it('delete link has correct href', async () => {
        const screen = render(AccountList, {
            props: {
                accounts: [mockAccount],
                literals,
                loading: false,
                createHref: '/accounts/new',
                editHref: '/accounts/{id}/edit',
                deleteHref: '/accounts/{id}/delete'
            }
        })

        const deleteLink = screen.getByTestId('delete-button')
        await expect.element(deleteLink).toHaveAttribute('href', '/accounts/1/delete')
    })
})
