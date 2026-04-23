import { describe, it, expect, vi } from 'vitest'
import { jsonRequest, bearerAuth, jsonResponse, noResponse } from './parsers.js'
import * as testing from '../testing/index.js'

/**
 * @import { RequestContext } from "./types.js"
 */

describe('parser factories', () => {
    describe('jsonRequest', () => {
        it('should create parser that sets JSON body and Content-Type', async () => {
            const parser = jsonRequest({ name: 'Test' })
            const result = await parser()

            expect(result).toEqual({
                headers: { 'Content-Type': 'application/json' },
                body: '{"name":"Test"}'
            })
        })

        it('should throw error when JSON serialization fails', () => {
            const circular = {}
            circular.self = circular

            const parser = jsonRequest(circular)

            expect(() => parser()).toThrow(/JSON serialization failed/)
        })
    })

    describe('bearerAuth', () => {
        it('should create parser that adds Authorization header', async () => {
            const parser = bearerAuth('token123')
            const result = await parser()

            expect(result).toEqual({
                headers: { Authorization: 'Bearer token123' }
            })
        })

        it('should throw error when token is not a string', () => {
            expect(() => bearerAuth('')).toThrow('Bearer token must be a non-empty string')
        })
    })

    describe('jsonResponse', () => {
        it('should create parser with accepts property', () => {
            const parser = jsonResponse()
            expect(parser.accepts).toBe('application/json')
            expect(parser.parse).toBeTypeOf('function')
        })

        it('should create parser with transformer', () => {
            const transformer = vi.fn()
            const parser = jsonResponse(transformer)
            expect(parser.accepts).toBe('application/json')
            expect(parser.parse).toBeTypeOf('function')
        })

        describe('parseJsonResponse behavior (through jsonResponse)', () => {
            it('should parse successful JSON response', async () => {
                const response = testing.createJsonResponse({ body: { data: 'test' } })
                const jsonSpy = vi.spyOn(response, 'json')

                const parser = jsonResponse()
                /** @type {RequestContext} */
                const requestContext = { url: '/test', method: 'GET' }
                const result = await parser.parse(response, requestContext)

                expect(result).toEqual({ ok: true, data: { data: 'test' } })
                expect(jsonSpy).toHaveBeenCalled()
            })

            it('should throw HttpJsonError for JSON error responses', async () => {
                const response = testing.createJsonResponse({
                    body: { error: 'Invalid input' },
                    status: 400,
                    statusText: 'Bad Request'
                })

                const parser = jsonResponse()
                /** @type {RequestContext} */
                const requestContext = { url: '/test', method: 'POST' }

                expect(await parser.parse(response, requestContext)).toMatchObject({
                    ok: false,
                    error: {
                        message: 'HTTP 400: Bad Request'
                    }
                })
            })

            it('should throw HttpError for non-JSON error responses', async () => {
                const response = testing.createTextResponse({
                    text: 'Internal server error',
                    status: 500,
                    statusText: 'Server Error'
                })

                const parser = jsonResponse()
                /** @type {RequestContext} */
                const requestContext = { url: '/test', method: 'GET' }

                expect(await parser.parse(response, requestContext)).toMatchObject({
                    ok: false,
                    error: {
                        message: 'HTTP 500: Server Error'
                    }
                })
            })

            it('should throw HttpError for content-type mismatch on success', async () => {
                const response = testing.createTextResponse({
                    text: 'Not JSON',
                    contentType: 'text/plain'
                })

                const parser = jsonResponse()
                /** @type {RequestContext} */
                const requestContext = { url: '/test', method: 'GET' }

                expect(await parser.parse(response, requestContext)).toMatchObject({
                    ok: false,
                    error: {
                        message: 'Expected JSON response but got text/plain'
                    }
                })
            })

            it('should support transformer function', async () => {
                const response = testing.createJsonResponse({ body: { id: 1, name: 'Test' } })
                const transformer = vi.fn().mockImplementation((body, headers) => ({
                    ...body,
                    transformed: true,
                    contentType: headers['content-type']
                }))

                const parser = jsonResponse(transformer)
                const result = await parser.parse(response, { url: '/test', method: 'GET' })

                expect(transformer).toHaveBeenCalledWith(
                    { id: 1, name: 'Test' },
                    { 'content-type': 'application/json' }
                )
                expect(result).toEqual({
                    ok: true,
                    data: {
                        id: 1,
                        name: 'Test',
                        transformed: true,
                        contentType: 'application/json'
                    }
                })
            })
        })
    })

    describe('noResponse', () => {
        it('should create parser with "*" accepts property', () => {
            const parser = noResponse()
            expect(parser.accepts).toBe('*')
            expect(parser.parse).toBeTypeOf('function')
        })
    })
})
