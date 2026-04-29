import { describe, it, expect, beforeEach } from 'vitest'
import { createHttpClientStub, createJsonResponse, createNetworkError } from '@ems/http/testing'
import { defaultLanguage, resolveErrorLiterals } from '@ems/domain-shared-schema'
import { accountErrorsI18n } from '@ems/domain-shared-account'
import { accountListLoader } from './account-list.js'

const errorLiterals = resolveErrorLiterals('en_US', accountErrorsI18n)

describe('accountListLoader', () => {
    /** @type {ReturnType<typeof createHttpClientStub>} */
    let httpStub

    beforeEach(() => {
        httpStub = createHttpClientStub()
    })

    it('returns accounts and literals on success', async () => {
        const mockAccounts = {
            items: [
                {
                    id: '1',
                    userId: 'user-1',
                    name: 'Nubank Checking',
                    type: 'BANK',
                    currency: 'BRL',
                    balance: '1000',
                    createdAt: '2026-04-25T00:00:00Z',
                    updatedAt: '2026-04-25T00:00:00Z'
                }
            ],
            size: 10,
            nextPageCursor: null
        }
        httpStub.fetch.mockResolvedValue(createJsonResponse({ body: mockAccounts }))

        const result = await accountListLoader({
            client: httpStub.client,
            locale: defaultLanguage
        })

        expect(result).toMatchObject({
            isSuccess: true,
            status: 200,
            accounts: mockAccounts.items,
            pagination: { size: 10, nextPageCursor: null }
        })
        expect(result.literals).toBeDefined()
        expect(result.literals.pageTitle).toBe('Accounts')
        expect(result.literals.accountCard.balanceLabel).toBe('Balance')
    })

    it('returns empty list when no accounts', async () => {
        const mockAccounts = { items: [], size: 10, nextPageCursor: null }
        httpStub.fetch.mockResolvedValue(createJsonResponse({ body: mockAccounts }))

        const result = await accountListLoader({
            client: httpStub.client,
            locale: defaultLanguage
        })

        expect(result).toMatchObject({
            isSuccess: true,
            status: 200,
            accounts: [],
            pagination: { size: 10, nextPageCursor: null }
        })
    })

    it('uses pt_BR locale for literals', async () => {
        const mockAccounts = { items: [], size: 10, nextPageCursor: null }
        httpStub.fetch.mockResolvedValue(createJsonResponse({ body: mockAccounts }))

        const result = await accountListLoader({
            client: httpStub.client,
            locale: 'pt_BR'
        })

        expect(result.literals.pageTitle).toBe('Contas')
        expect(result.literals.accountCard.balanceLabel).toBe('Saldo')
    })

    it('passes pagination cursor through', async () => {
        const mockAccounts = {
            items: [
                {
                    id: '1',
                    userId: 'user-1',
                    name: 'Nubank Checking',
                    type: 'BANK',
                    currency: 'BRL',
                    balance: '1000',
                    createdAt: '2026-04-25T00:00:00Z',
                    updatedAt: '2026-04-25T00:00:00Z'
                }
            ],
            size: 5,
            nextPageCursor: 'cursor-abc'
        }
        httpStub.fetch.mockResolvedValue(createJsonResponse({ body: mockAccounts }))

        const result = await accountListLoader({
            client: httpStub.client,
            locale: defaultLanguage
        })

        expect(result).toMatchObject({
            isSuccess: true,
            status: 200,
            accounts: mockAccounts.items,
            pagination: { size: 5, nextPageCursor: 'cursor-abc' }
        })
    })

    it('handles HTTP errors', async () => {
        httpStub.fetch.mockResolvedValue(
            createJsonResponse({
                body: { code: 'INTERNAL_ERROR', message: 'Server error' },
                status: 500
            })
        )

        const result = await accountListLoader({
            client: httpStub.client,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(500)
        expect(result.errorMessage).toBe(errorLiterals.somethingWentWrongError)
        expect(result.accounts).toEqual([])
        expect(result.pagination).toEqual({ size: 10, nextPageCursor: null })
        expect(result.literals).toBeDefined()
    })

    it('handles network errors', async () => {
        httpStub.fetch.mockRejectedValue(createNetworkError('ECONNREFUSED'))

        const result = await accountListLoader({
            client: httpStub.client,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(503)
        expect(result.errorMessage).toBe(errorLiterals.serviceUnavailableError)
        expect(result.accounts).toEqual([])
        expect(result.pagination).toEqual({ size: 10, nextPageCursor: null })
        expect(result.literals).toBeDefined()
    })
})
