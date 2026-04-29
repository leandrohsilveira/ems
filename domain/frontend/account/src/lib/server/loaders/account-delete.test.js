import { describe, it, expect, beforeEach } from 'vitest'
import { createHttpClientStub, createJsonResponse, createNetworkError } from '@ems/http/testing'
import { defaultLanguage, resolveErrorLiterals } from '@ems/domain-shared-schema'
import { accountErrorsI18n } from '@ems/domain-shared-account'
import { deleteAccountLoader } from './account-delete.js'

const errorLiterals = resolveErrorLiterals('en_US', accountErrorsI18n)

describe('deleteAccountLoader', () => {
    /** @type {ReturnType<typeof createHttpClientStub>} */
    let httpStub

    beforeEach(() => {
        httpStub = createHttpClientStub()
    })

    it('returns account and literals on success', async () => {
        const mockAccount = {
            id: '1',
            userId: 'user-1',
            name: 'Nubank Checking',
            type: 'BANK',
            currency: 'BRL',
            balance: '1000',
            createdAt: '2026-04-25T00:00:00Z',
            updatedAt: '2026-04-25T00:00:00Z'
        }
        httpStub.fetch.mockResolvedValue(createJsonResponse({ body: { account: mockAccount } }))

        const result = await deleteAccountLoader({
            id: '1',
            client: httpStub.client,
            locale: defaultLanguage
        })

        expect(httpStub.fetch).toHaveBeenCalledWith(
            'http://localhost/accounts/1',
            expect.objectContaining({ method: 'GET' })
        )
        expect(result).toMatchObject({
            isSuccess: true,
            status: 200,
            account: mockAccount
        })
        expect(result.literals).toBeDefined()
        expect(result.literals.title).toBe('Delete Account')
        expect(result.literals.deleteButton).toBe('Delete')
    })

    it('uses pt_BR locale for literals', async () => {
        const mockAccount = {
            id: '1',
            userId: 'user-1',
            name: 'Nubank Checking',
            type: 'BANK',
            currency: 'BRL',
            balance: '1000',
            createdAt: '2026-04-25T00:00:00Z',
            updatedAt: '2026-04-25T00:00:00Z'
        }
        httpStub.fetch.mockResolvedValue(createJsonResponse({ body: { account: mockAccount } }))

        const result = await deleteAccountLoader({
            id: '1',
            client: httpStub.client,
            locale: 'pt_BR'
        })

        expect(result.literals.title).toBe('Excluir Conta')
        expect(result.literals.deleteButton).toBe('Excluir')
        expect(result.literals.cancelButton).toBe('Cancelar')
    })

    it('handles 404 account not found', async () => {
        httpStub.fetch.mockResolvedValue(
            createJsonResponse({
                body: { code: 'NOT_FOUND', message: 'Account not found' },
                status: 404
            })
        )

        const result = await deleteAccountLoader({
            id: '999',
            client: httpStub.client,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(404)
        expect(result.errorMessage).toBe(errorLiterals.accountNotFound)
        expect(result.literals).toBeDefined()
    })

    it('handles HTTP errors with generic fallback', async () => {
        httpStub.fetch.mockResolvedValue(
            createJsonResponse({
                body: { code: 'INTERNAL_ERROR', message: 'Server error' },
                status: 500
            })
        )

        const result = await deleteAccountLoader({
            id: '1',
            client: httpStub.client,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(500)
        expect(result.errorMessage).toBe(errorLiterals.somethingWentWrongError)
        expect(result.literals).toBeDefined()
    })

    it('handles network errors', async () => {
        httpStub.fetch.mockRejectedValue(createNetworkError('ECONNREFUSED'))

        const result = await deleteAccountLoader({
            id: '1',
            client: httpStub.client,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(503)
        expect(result.errorMessage).toBe(errorLiterals.serviceUnavailableError)
        expect(result.literals).toBeDefined()
    })
})
