import { describe, it, expect, beforeEach } from 'vitest'
import { createHttpClientStub, createJsonResponse, createNetworkError } from '@ems/http/testing'
import { defaultLanguage, resolveErrorLiterals } from '@ems/domain-shared-schema'
import { submitDeleteAccountAction } from './delete-account.js'
import { accountErrorsI18n } from '@ems/domain-shared-account'

const errorLiterals = resolveErrorLiterals('en_US', accountErrorsI18n)

describe('submitDeleteAccountAction', () => {
    /** @type {ReturnType<typeof createHttpClientStub>} */
    let httpStub

    beforeEach(() => {
        httpStub = createHttpClientStub()
    })

    it('returns success on successful delete', async () => {
        httpStub.fetch.mockResolvedValue(
            createJsonResponse({ body: { message: 'Account deleted successfully' } })
        )

        const result = await submitDeleteAccountAction({
            client: httpStub.client,
            accountId: '1',
            locale: defaultLanguage
        })

        expect(result).toMatchObject({
            isSuccess: true,
            status: 200
        })
        expect(httpStub.fetch).toHaveBeenCalledWith(
            'http://localhost/accounts/1',
            expect.objectContaining({ method: 'DELETE' })
        )
    })

    it('handles 404 (account not found)', async () => {
        httpStub.fetch.mockResolvedValue(
            createJsonResponse({ body: { code: 'NOT_FOUND', message: 'Not found' }, status: 404 })
        )

        const result = await submitDeleteAccountAction({
            client: httpStub.client,
            accountId: '999',
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(404)
        expect(result.errorMessage).toBe(errorLiterals.accountNotFound)
    })

    it('handles 409 (has transactions)', async () => {
        httpStub.fetch.mockResolvedValue(
            createJsonResponse({
                body: { code: 'CONFLICT', message: 'Has transactions' },
                status: 409
            })
        )

        const result = await submitDeleteAccountAction({
            client: httpStub.client,
            accountId: '1',
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(409)
        expect(result.errorMessage).toBe(errorLiterals.accountHasTransactions)
    })

    it('handles 403 (not owned)', async () => {
        httpStub.fetch.mockResolvedValue(
            createJsonResponse({ body: { code: 'FORBIDDEN', message: 'Forbidden' }, status: 403 })
        )

        const result = await submitDeleteAccountAction({
            client: httpStub.client,
            accountId: '1',
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(403)
        expect(result.errorMessage).toBe(errorLiterals.accountNotOwned)
    })

    it('handles network errors', async () => {
        httpStub.fetch.mockRejectedValue(createNetworkError('ECONNREFUSED'))

        const result = await submitDeleteAccountAction({
            client: httpStub.client,
            accountId: '1',
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(503)
        expect(result.errorMessage).toBeDefined()
    })
})
