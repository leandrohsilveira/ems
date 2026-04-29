import { describe, it, expect, beforeEach } from 'vitest'
import { createHttpClientStub, createJsonResponse, createNetworkError } from '@ems/http/testing'
import { defaultLanguage } from '@ems/domain-shared-schema'
import { submitCreateAccountAction } from './create-account.js'

describe('submitCreateAccountAction', () => {
    /** @type {ReturnType<typeof createHttpClientStub>} */
    let httpStub

    beforeEach(() => {
        httpStub = createHttpClientStub()
    })

    it('returns validation errors for invalid form data', async () => {
        const form = new FormData()
        // Empty form — name is required
        form.set('name', '')

        const result = await submitCreateAccountAction({
            client: httpStub.client,
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

    it('returns success with account on valid creation', async () => {
        const form = new FormData()
        form.set('name', 'Nubank Checking')
        form.set('initialBalance', '1000')

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
        httpStub.fetch.mockResolvedValue(
            createJsonResponse({ body: { account: mockAccount }, status: 201 })
        )

        const result = await submitCreateAccountAction({
            client: httpStub.client,
            form,
            locale: defaultLanguage
        })

        expect(result).toMatchObject({
            isSuccess: true,
            status: 201,
            account: mockAccount
        })
        // Verify currency is hardcoded to BRL
        expect(httpStub.fetch).toHaveBeenCalledWith(
            'http://localhost/accounts',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    name: 'Nubank Checking',
                    initialBalance: 1000,
                    currency: 'BRL'
                })
            })
        )
    })

    it('returns default initialBalance when not provided', async () => {
        const form = new FormData()
        form.set('name', 'Nubank Checking')

        httpStub.fetch.mockResolvedValue(
            createJsonResponse({
                body: {
                    account: {
                        id: '1',
                        userId: 'user-1',
                        name: 'Nubank Checking',
                        type: 'BANK',
                        currency: 'BRL',
                        balance: '0',
                        createdAt: '2026-04-25T00:00:00Z',
                        updatedAt: '2026-04-25T00:00:00Z'
                    }
                },
                status: 201
            })
        )

        const result = await submitCreateAccountAction({
            client: httpStub.client,
            form
        })

        expect(result.isSuccess).toBe(true)
        expect(httpStub.fetch).toHaveBeenCalledWith(
            'http://localhost/accounts',
            expect.objectContaining({
                body: expect.stringContaining('"initialBalance":0')
            })
        )
    })

    it('handles network errors', async () => {
        const form = new FormData()
        form.set('name', 'Nubank Checking')

        httpStub.fetch.mockRejectedValue(createNetworkError('ECONNREFUSED'))

        const result = await submitCreateAccountAction({
            client: httpStub.client,
            form,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(503)
        expect(result.errorMessage).toBeDefined()
    })

    it('uses pt_BR locale for validation messages', async () => {
        const form = new FormData()
        form.set('name', '')

        const result = await submitCreateAccountAction({
            client: httpStub.client,
            form,
            locale: 'pt_BR'
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(400)
        expect(result.errors).toMatchObject({
            fields: {
                name: expect.arrayContaining(['O nome da conta é obrigatório'])
            }
        })
    })
})
