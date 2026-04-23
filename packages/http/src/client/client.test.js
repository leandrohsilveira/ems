import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createHttpClient } from './client.js'
import { jsonRequest, bearerAuth, jsonResponse, noResponse } from './parsers.js'
import * as testing from '../testing/index.js'

describe('createHttpClient', () => {
    /** @type {import('vitest').Mock} */
    let mockFetch

    beforeEach(() => {
        mockFetch = vi.fn()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('call method', () => {
        it('should make GET request with JSON response', async () => {
            // Using mockFetchWithJson helper
            mockFetch = testing.mockFetchWithJson({
                body: { id: 1, name: 'Test' }
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            const result = await client.get('/test', {
                response: jsonResponse()
            })

            expect(result).toEqual({ ok: true, data: { id: 1, name: 'Test' } })
            expect(mockFetch).toHaveBeenCalledWith(
                'http://api.example.com/test',
                expect.objectContaining({
                    method: 'GET',
                    headers: [['Accept', 'application/json']]
                })
            )
        })

        it('should make POST request with JSON body', async () => {
            // Using createMockResponse for more control
            const response = testing.createMockResponse({
                json: { id: 1, created: true },
                status: 201
            })

            mockFetch = vi.fn().mockResolvedValue(response)

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            const result = await client.post('/test', {
                request: jsonRequest({ name: 'Test' }),
                response: jsonResponse()
            })

            expect(result).toEqual({ ok: true, data: { id: 1, created: true } })
            expect(mockFetch).toHaveBeenCalledWith(
                'http://api.example.com/test',
                expect.objectContaining({
                    method: 'POST',
                    headers: [
                        ['Accept', 'application/json'],
                        ['Content-Type', 'application/json']
                    ],
                    body: '{"name":"Test"}'
                })
            )
        })

        it('should make request with Bearer auth', async () => {
            mockFetch = testing.mockFetchWithJson({
                body: { user: 'test' }
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            const result = await client.get('/profile', {
                request: bearerAuth('token123'),
                response: jsonResponse()
            })

            expect(result).toEqual({ ok: true, data: { user: 'test' } })
            expect(mockFetch).toHaveBeenCalledWith(
                'http://api.example.com/profile',
                expect.objectContaining({
                    method: 'GET',
                    headers: [
                        ['Accept', 'application/json'],
                        ['Authorization', 'Bearer token123']
                    ]
                })
            )
        })

        it('should handle query parameters', async () => {
            mockFetch = testing.mockFetchWithJson({
                body: { items: [] }
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            const result = await client.get('/items', {
                request: { query: { page: '1', limit: '10' } },
                response: jsonResponse()
            })

            expect(result).toEqual({ ok: true, data: { items: [] } })
            expect(mockFetch).toHaveBeenCalledWith(
                'http://api.example.com/items?page=1&limit=10',
                expect.anything()
            )
        })

        it('should merge Accept headers from request and response parsers', async () => {
            mockFetch = testing.mockFetchWithJson({
                body: {}
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            await client.get('/test', {
                request: { headers: { Accept: 'text/plain' } },
                response: jsonResponse()
            })

            expect(mockFetch).toHaveBeenCalledWith(
                'http://api.example.com/test',
                expect.objectContaining({
                    headers: [['Accept', 'application/json, text/plain']]
                })
            )
        })
    })

    describe('error handling', () => {
        beforeEach(() => vi.spyOn(console, 'error').mockImplementation(vi.fn()))

        it('should return NETWORK_ERROR result on fetch failure', async () => {
            /** @type {Error & { code?: string }} */
            const cause = new Error('ECONNREFUSED')
            cause.code = 'ECONNREFUSED'

            mockFetch.mockRejectedValue(testing.createNetworkError('ECONNREFUSED'))

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })

            expect(await client.get('/test', { response: jsonResponse() })).toMatchObject({
                ok: false,
                error: {
                    type: 'NETWORK_ERROR',
                    message: 'Service temporarily unavailable. Please, try again later.',
                    context: expect.any(Object)
                }
            })
        })

        it('should return HTTP_ERROR result for JSON error responses', async () => {
            mockFetch = testing.mockFetchWithJson({
                body: { error: 'Invalid input' },
                status: 400,
                statusText: 'Bad Request'
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })

            expect(await client.get('/test', { response: jsonResponse() })).toMatchObject({
                ok: false,
                error: {
                    type: 'HTTP_ERROR',
                    status: 400,
                    message: 'HTTP 400: Bad Request',
                    parsed: true,
                    body: { error: 'Invalid input' },
                    context: expect.any(Object),
                    headers: expect.any(Object),
                    response: expect.any(Response)
                }
            })
        })

        it('should return HTTP_ERROR result for non-JSON error responses', async () => {
            mockFetch = testing.mockFetchWithText({
                text: 'Internal server error',
                status: 500,
                statusText: 'Server Error'
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })

            expect(await client.get('/test', { response: jsonResponse() })).toMatchObject({
                ok: false,
                error: {
                    type: 'HTTP_ERROR',
                    parsed: false,
                    status: 500,
                    message: 'HTTP 500: Server Error',
                    context: expect.any(Object),
                    headers: expect.any(Object),
                    response: expect.any(Response)
                }
            })
        })

        it('should return HTTP_ERROR result for content-type mismatch', async () => {
            mockFetch = testing.mockFetchWithText({
                text: 'Not JSON',
                contentType: 'text/plain'
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })

            expect(await client.get('/test', { response: jsonResponse() })).toMatchObject({
                ok: false,
                error: {
                    type: 'HTTP_ERROR',
                    parsed: false,
                    reason: 'CONTENT_TYPE_MISMATCH',
                    message: 'Expected JSON response but got text/plain',
                    expected: 'application/json',
                    received: 'text/plain',
                    body: 'Not JSON',
                    context: expect.any(Object),
                    headers: expect.any(Object),
                    response: expect.any(Response)
                }
            })
        })

        it('should return UNEXPECTED_ERROR result when parser throws error', async () => {
            // Create a circular reference that will fail JSON.stringify
            const circularObj = {}
            circularObj.self = circularObj

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            const result = await client.post('/test', {
                request: jsonRequest(circularObj),
                response: jsonResponse()
            })

            expect(result).toMatchObject({
                ok: false,
                error: {
                    type: 'UNEXPECTED_ERROR',
                    message: 'Something went wrong. Please, try again later.',
                    context: expect.any(Object)
                }
            })
        })

        it('should return UNEXPECTED_ERROR result for generic errors', async () => {
            const genericError = new Error('Something unexpected happened')
            mockFetch.mockRejectedValue(genericError)

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            const result = await client.get('/test', { response: jsonResponse() })

            expect(result).toMatchObject({
                ok: false,
                error: {
                    type: 'UNEXPECTED_ERROR',
                    message: 'Something went wrong. Please, try again later.',
                    context: expect.any(Object)
                }
            })
        })

        it('should return UNEXPECTED_ERROR result for timeout errors (not ECONNREFUSED)', async () => {
            mockFetch.mockRejectedValue(testing.createNetworkError('ETIMEDOUT'))

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            const result = await client.get('/test', { response: jsonResponse() })

            expect(result).toMatchObject({
                ok: false,
                error: {
                    type: 'UNEXPECTED_ERROR',
                    message: 'Something went wrong. Please, try again later.',
                    context: expect.any(Object)
                }
            })
        })

        it('should handle errors with noResponse parser', async () => {
            mockFetch = testing.mockFetchWithJson({
                body: { error: 'Not found' },
                status: 404,
                statusText: 'Not Found'
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            const result = await client.get('/missing', {
                response: noResponse()
            })

            expect(result).toMatchObject({
                ok: false,
                error: {
                    type: 'HTTP_ERROR',
                    parsed: true,
                    status: 404,
                    message: 'HTTP 404: Not Found',
                    body: { error: 'Not found' },
                    context: expect.any(Object),
                    headers: expect.any(Object),
                    response: expect.any(Response)
                }
            })
        })
    })

    describe('HTTP method aliases', () => {
        it('should delegate GET to call method', async () => {
            mockFetch = testing.mockFetchWithJson({
                body: {}
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            await client.get('/test', { response: jsonResponse() })

            expect(mockFetch).toHaveBeenCalledWith(
                'http://api.example.com/test',
                expect.objectContaining({ method: 'GET' })
            )
        })

        it('should handle noResponse parser for successful requests', async () => {
            mockFetch = testing.mockFetchWithText({
                text: '',
                status: 200,
                statusText: 'OK'
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            const result = await client.delete('/resource/1', {
                response: noResponse()
            })

            expect(result).toEqual({ ok: true, data: undefined })
            expect(mockFetch).toHaveBeenCalledWith(
                'http://api.example.com/resource/1',
                expect.objectContaining({ method: 'DELETE' })
            )
        })

        it('should delegate POST to call method', async () => {
            mockFetch = testing.mockFetchWithJson({
                body: {}
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            await client.post('/test', { response: jsonResponse() })

            expect(mockFetch).toHaveBeenCalledWith(
                'http://api.example.com/test',
                expect.objectContaining({ method: 'POST' })
            )
        })

        it('should delegate PUT to call method', async () => {
            mockFetch = testing.mockFetchWithJson({
                body: {}
            })

            const client = createHttpClient(mockFetch, { baseUrl: 'http://api.example.com' })
            await client.put('/test', { response: jsonResponse() })

            expect(mockFetch).toHaveBeenCalledWith(
                'http://api.example.com/test',
                expect.objectContaining({ method: 'PUT' })
            )
        })
    })
})
