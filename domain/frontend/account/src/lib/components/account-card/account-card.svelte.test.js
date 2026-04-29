import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import AccountCard from './account-card.svelte'
import { accountCardI18n } from './account-card.i18n.js'
import { resolve } from '@ems/i18n'
import { AccountType } from '@ems/domain-shared-account'

const literals = resolve('en', accountCardI18n)

const baseAccount = {
    id: '1',
    userId: 'user-1',
    name: 'Nubank Checking',
    type: AccountType.BANK,
    currency: 'BRL',
    balance: '1000.50',
    createdAt: '2026-04-25T00:00:00Z',
    updatedAt: '2026-04-25T00:00:00Z'
}

describe('AccountCard', () => {
    it('renders account name', async () => {
        const screen = render(AccountCard, {
            props: { account: baseAccount, literals, editHref: '#', deleteHref: '#' }
        })

        await expect.element(screen.getByText('Nubank Checking')).toBeVisible()
    })

    it('renders balance label', async () => {
        const screen = render(AccountCard, {
            props: { account: baseAccount, literals, editHref: '#', deleteHref: '#' }
        })

        await expect.element(screen.getByText('Balance')).toBeVisible()
    })

    it('renders created label', async () => {
        const screen = render(AccountCard, {
            props: { account: baseAccount, literals, editHref: '#', deleteHref: '#' }
        })

        await expect.element(screen.getByText('Created')).toBeVisible()
    })

    it('renders "Bank Account" label', async () => {
        const screen = render(AccountCard, {
            props: { account: baseAccount, literals, editHref: '#', deleteHref: '#' }
        })

        await expect.element(screen.getByText('Bank Account')).toBeVisible()
    })

    it('renders edit link with correct href', async () => {
        const screen = render(AccountCard, {
            props: { account: baseAccount, literals, editHref: '/accounts/1/edit', deleteHref: '#' }
        })

        const editLink = screen.getByTestId('edit-button')
        await expect.element(editLink).toHaveAttribute('href', '/accounts/1/edit')
    })

    it('renders delete link with correct href', async () => {
        const screen = render(AccountCard, {
            props: {
                account: baseAccount,
                literals,
                editHref: '#',
                deleteHref: '/accounts/1/delete'
            }
        })

        const deleteLink = screen.getByTestId('delete-button')
        await expect.element(deleteLink).toHaveAttribute('href', '/accounts/1/delete')
    })

    it('renders card with test id', async () => {
        const screen = render(AccountCard, {
            props: { account: baseAccount, literals, editHref: '#', deleteHref: '#' }
        })

        await expect.element(screen.getByTestId('account-card')).toBeVisible()
    })
})
