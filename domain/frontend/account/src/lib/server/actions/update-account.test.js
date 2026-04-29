import { describe, it, expect, beforeEach } from 'vitest'
import { createHttpClientStub, createJsonResponse, createNetworkError } from '@ems/http/testing'
import { defaultLanguage, resolveErrorLiterals } from '@ems/domain-shared-schema'
import { submitUpdateAccountAction } from './update-account.js'
import { accountErrorsI18n } from '@ems/domain-shared-account'

const errorLiterals = resolveErrorLiterals('en_US', accountErrorsI18n)

describe('submitUpdateAccountAction', () => {
    /** @type {ReturnType<typeof createHttpClientStub>} */
    let httpStub

    beforeEach(() => {
        httpStub = createHttpClientStub()
    })

    it('returns validation errors for invalid form data', async () => {
        const form = new FormData()
        form.set('name', '')

        const result = await submitUpdateAccountAction({
            client: httpStub.client,
            accountId: '1',
            form,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(400)
        expect(result.errors).toBeDefined()
        expect(result.errors).toMatchObject({
            fields: {
                name: expect.arrayContaining(['Account name is required'])
            }
        })
    })

    it('returns success on valid update', async () => {
        const form = new FormData()
        form.set('name', 'Updated Name')

        const mockAccount = {
            id: '1',
            userId: 'user-1',
            name: 'Updated Name',
            type: 'BANK',
            currency: 'BRL',
            balance: '1000',
            createdAt: '2026-04-25T00:00:00Z',
            updatedAt: '2026-04-26T00:00:00Z'
        }
        httpStub.fetch.mockResolvedValue(createJsonResponse({ body: { account: mockAccount } }))

        const result = await submitUpdateAccountAction({
            client: httpStub.client,
            accountId: '1',
            form,
            locale: defaultLanguage
        })

        expect(result).toMatchObject({
            isSuccess: true,
            status: 200,
            account: mockAccount
        })
        expect(httpStub.fetch).toHaveBeenCalledWith(
            'http://localhost/accounts/1',
            expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ name: 'Updated Name' })
            })
        )
    })

    it('handles 404 (account not found)', async () => {
        const form = new FormData()
        form.set('name', 'Updated Name')

        httpStub.fetch.mockResolvedValue(
            createJsonResponse({ body: { code: 'NOT_FOUND', message: 'Not found' }, status: 404 })
        )

        const result = await submitUpdateAccountAction({
            client: httpStub.client,
            accountId: '999',
            form,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(404)
        expect(result.errorMessage).toBe(errorLiterals.accountNotFound)
    })

    it('handles 403 (not owned)', async () => {
        const form = new FormData()
        form.set('name', 'Updated Name')

        httpStub.fetch.mockResolvedValue(
            createJsonResponse({ body: { code: 'FORBIDDEN', message: 'Forbidden' }, status: 403 })
        )

        const result = await submitUpdateAccountAction({
            client: httpStub.client,
            accountId: '1',
            form,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(403)
        expect(result.errorMessage).toBe(errorLiterals.accountNotOwned)
    })

    it('handles network errors', async () => {
        const form = new FormData()
        form.set('name', 'Updated Name')

        httpStub.fetch.mockRejectedValue(createNetworkError('ECONNREFUSED'))

        const result = await submitUpdateAccountAction({
            client: httpStub.client,
            accountId: '1',
            form,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(503)
        expect(result.errorMessage).toBeDefined()
    })
})
