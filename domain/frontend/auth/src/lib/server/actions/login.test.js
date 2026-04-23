import { describe, it, expect, beforeEach } from 'vitest'
import { createHttpClientStub, createNetworkError, createJsonResponse } from '@ems/http/testing'
import { defaultLanguage, resolveErrorLiterals } from '@ems/domain-shared-schema'
import { submitLoginAction } from './login.js'
import { loginErrorsI18n } from '@ems/domain-shared-auth'

const literals = resolveErrorLiterals('en_US', loginErrorsI18n)

describe('submitLoginAction', () => {
    /** @type {import('@ems/http/testing').HttpClientStub} */
    let httpClientStub

    beforeEach(() => {
        httpClientStub = createHttpClientStub()
    })

    it('returns validation errors for invalid form data', async () => {
        const mockForm = new FormData()
        // Empty form data
        const result = await submitLoginAction({
            client: httpClientStub.client,
            form: mockForm,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(400)
        expect(result.errors).toBeDefined()
        expect(result.errors).toMatchObject({
            fields: {
                username: expect.arrayContaining(['Must enter the username']),
                password: expect.arrayContaining(['Must enter the password'])
            }
        })
    })

    it('returns success with tokens on valid login', async () => {
        const mockForm = new FormData()
        mockForm.set('username', 'testuser')
        mockForm.set('password', 'password123')

        const mockTokens = {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            expiresIn: 3600
        }

        httpClientStub.fetch.mockResolvedValue(
            createJsonResponse({ body: mockTokens, status: 200 })
        )

        const result = await submitLoginAction({
            client: httpClientStub.client,
            form: mockForm,
            locale: defaultLanguage
        })

        expect(result).toMatchObject({
            isSuccess: true,
            status: 200,
            tokens: mockTokens
        })
        expect(httpClientStub.fetch).toHaveBeenCalledWith(
            'http://localhost/auth/login',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ username: 'testuser', password: 'password123' })
            })
        )
    })

    it('returns error for invalid credentials', async () => {
        const mockForm = new FormData()
        mockForm.set('username', 'testuser')
        mockForm.set('password', 'wrongpassword')

        httpClientStub.fetch.mockResolvedValue(
            createJsonResponse({ body: { message: 'Invalid credentials' }, status: 401 })
        )

        const result = await submitLoginAction({
            client: httpClientStub.client,
            form: mockForm,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(401)
        expect(result).toMatchObject({
            errorMessage: literals.incorrectUsernameOrPassword
        })
    })

    it('handles network errors', async () => {
        const mockForm = new FormData()
        mockForm.set('username', 'testuser')
        mockForm.set('password', 'password123')

        httpClientStub.fetch.mockRejectedValue(createNetworkError('ECONNREFUSED'))

        const result = await submitLoginAction({
            client: httpClientStub.client,
            form: mockForm,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(503)
        expect(result).toMatchObject({
            errorMessage: literals.serviceUnavailableError
        })
    })

    it('handles other HTTP errors', async () => {
        const mockForm = new FormData()
        mockForm.set('username', 'testuser')
        mockForm.set('password', 'password123')

        httpClientStub.fetch.mockResolvedValue(
            createJsonResponse({ body: { message: 'Internal server error' }, status: 500 })
        )

        const result = await submitLoginAction({
            client: httpClientStub.client,
            form: mockForm,
            locale: defaultLanguage
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(500)
        expect(result).toMatchObject({
            errorMessage: literals.somethingWentWrongError
        })
    })

    it('uses different locale for validation messages', async () => {
        const mockForm = new FormData()
        // Empty form data
        const result = await submitLoginAction({
            client: httpClientStub.client,
            form: mockForm,
            locale: 'pt_BR'
        })

        expect(result.isSuccess).toBe(false)
        expect(result.status).toBe(400)
        expect(result.errors).toBeDefined()
        // Test that validation errors contain actual messages
        expect(result.errors).toMatchObject({
            fields: {
                username: expect.arrayContaining(['É necessário informar o nome de usuário']),
                password: expect.arrayContaining(['É necessário informar a senha'])
            }
        })
    })
})
