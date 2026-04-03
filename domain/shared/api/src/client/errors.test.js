import { describe, expect, it } from 'vitest'
import { HttpError, HttpJsonError, NetworkError } from './errors.js'
import { createMockResponse } from '../testing/response.js'

describe('NetworkError class', () => {
    describe('is() static function', () => {
        it('should return true when the given object is an instance of NetworkError class', () => {
            expect(
                NetworkError.is(
                    new NetworkError('error', { url: 'http://localhost/test', method: 'GET' })
                )
            ).toBe(true)
        })

        it('should return false when the given object is an instance of HttpError class', () => {
            expect(
                NetworkError.is(
                    new HttpError(
                        'error',
                        createMockResponse({ status: 500, statusText: 'Internal Server Error' }),
                        '',
                        {}
                    )
                )
            ).toBe(false)
        })

        it('should return false when the given object is an instance of HttpJsonError class', () => {
            expect(
                NetworkError.is(
                    new HttpJsonError(
                        'error',
                        createMockResponse({ status: 500, statusText: 'Internal Server Error' }),
                        { data: 'test' },
                        {}
                    )
                )
            ).toBe(false)
        })
    })
})

describe('HttpError class', () => {
    describe('is() static function', () => {
        it('should return true when the given object is an instance of HttpError class', () => {
            expect(
                HttpError.is(
                    new HttpError(
                        'error',
                        createMockResponse({ status: 500, statusText: 'Internal Server Error' }),
                        '',
                        {}
                    )
                )
            ).toBe(true)
        })

        it('should return true when the given object is an instance of HttpJsonError class (inherits from HttpError)', () => {
            expect(
                HttpError.is(
                    new HttpJsonError(
                        'error',
                        createMockResponse({ status: 500, statusText: 'Internal Server Error' }),
                        { data: 'test' },
                        {}
                    )
                )
            ).toBe(true)
        })

        it('should return false when the given object is an instance of NetworkError class', () => {
            expect(
                HttpError.is(
                    new NetworkError('error', { url: 'http://localhost/test', method: 'GET' })
                )
            ).toBe(false)
        })
    })
})

describe('HttpJsonError class', () => {
    describe('is() static function', () => {
        it('should return true when the given object is an instance of HttpJsonError class', () => {
            expect(
                HttpJsonError.is(
                    new HttpJsonError(
                        'error',
                        createMockResponse({ status: 500, statusText: 'Internal Server Error' }),
                        { data: 'test' },
                        {}
                    )
                )
            ).toBe(true)
        })

        it('should return false when the given object is an instance of HttpError class', () => {
            expect(
                HttpJsonError.is(
                    new HttpError(
                        'error',
                        createMockResponse({ status: 500, statusText: 'Internal Server Error' }),
                        '',
                        {}
                    )
                )
            ).toBe(false)
        })

        it('should return false when the given object is an instance of NetworkError class', () => {
            expect(
                HttpJsonError.is(
                    new NetworkError('error', { url: 'http://localhost/test', method: 'GET' })
                )
            ).toBe(false)
        })
    })
})
