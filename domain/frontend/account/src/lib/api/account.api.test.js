import { describe, it, expect, beforeEach } from 'vitest'
import { createHttpClientStub, createJsonResponse } from '@ems/http/testing'
import { createAccountApi } from './account.api.js'

describe('createAccountApi', () => {
    /** @type {ReturnType<typeof createHttpClientStub>} */
    let httpStub
    /** @type {ReturnType<typeof createAccountApi>} */
    let accountApi

    beforeEach(() => {
        httpStub = createHttpClientStub({ baseUrl: 'http://api.example.com' })
        accountApi = createAccountApi(httpStub.client)
    })

    describe('createAccount', () => {
        it('sends POST request to /accounts with account data', async () => {
            const data = { name: 'Nubank Checking', initialBalance: 1000, currency: 'BRL' }
            const response = {
                account: {
                    id: '1',
                    userId: 'user-1',
                    name: 'Nubank Checking',
                    type: 'BANK',
                    currency: 'BRL',
                    balance: '1000',
                    createdAt: '2026-04-25T00:00:00Z',
                    updatedAt: '2026-04-25T00:00:00Z'
                }
            }
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: response, status: 201 }))

            const result = await accountApi.createAccount(data)

            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/accounts',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(data)
                })
            )
            expect(result).toEqual({ ok: true, data: response })
        })

        it('forwards HTTP errors', async () => {
            httpStub.fetch.mockResolvedValue(
                createJsonResponse({
                    body: { code: 'VALIDATION_FAILED', message: 'Invalid' },
                    status: 400
                })
            )

            const result = await accountApi.createAccount({
                name: '',
                initialBalance: 0,
                currency: 'BRL'
            })

            expect(result.ok).toBe(false)
        })
    })

    describe('listAccounts', () => {
        it('sends GET request to /accounts', async () => {
            const response = { items: [], size: 10, nextPageCursor: null }
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: response }))

            const result = await accountApi.listAccounts()

            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/accounts',
                expect.objectContaining({ method: 'GET' })
            )
            expect(result).toEqual({ ok: true, data: response })
        })

        it('appends page query parameters when provided', async () => {
            httpStub.fetch.mockResolvedValue(
                createJsonResponse({ body: { items: [], size: 5, nextPageCursor: 'cursor-2' } })
            )

            await accountApi.listAccounts({ size: '5', cursor: 'cursor-1' })

            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/accounts?size=5&cursor=cursor-1',
                expect.anything()
            )
        })
    })

    describe('getAccountById', () => {
        it('sends GET request to /accounts/:id', async () => {
            const response = { account: { id: '1', name: 'Nubank Checking' } }
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: response }))

            const result = await accountApi.getAccountById('1')

            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/accounts/1',
                expect.objectContaining({ method: 'GET' })
            )
            expect(result).toEqual({ ok: true, data: response })
        })
    })

    describe('updateAccount', () => {
        it('sends PATCH request to /accounts/:id with name', async () => {
            const response = { account: { id: '1', name: 'Updated Name' } }
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: response }))

            const result = await accountApi.updateAccount('1', { name: 'Updated Name' })

            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/accounts/1',
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify({ name: 'Updated Name' })
                })
            )
            expect(result).toEqual({ ok: true, data: response })
        })
    })

    describe('deleteAccount', () => {
        it('sends DELETE request to /accounts/:id', async () => {
            const response = { message: 'Account deleted successfully' }
            httpStub.fetch.mockResolvedValue(createJsonResponse({ body: response }))

            const result = await accountApi.deleteAccount('1')

            expect(httpStub.fetch).toHaveBeenCalledWith(
                'http://api.example.com/accounts/1',
                expect.objectContaining({ method: 'DELETE' })
            )
            expect(result).toEqual({ ok: true, data: response })
        })
    })
})
