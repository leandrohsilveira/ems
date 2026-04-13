/** @import { RequestParser, ResponseParser, RequestContext, HttpResult, DefaultErrorFormat, HttpErrorResult } from "./types.js" */

// Parser factories

/**
 * Creates a request parser that sets JSON body and Content-Type header
 * @param {unknown} body - The data to serialize as JSON
 * @returns {RequestParser} Request parser function
 * @throws {Error} If JSON serialization fails
 */
export function jsonRequest(body) {
    return () => {
        try {
            return {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }
        } catch (/** @type {any} */ error) {
            throw new Error(`JSON serialization failed: ${error.message}`, { cause: error })
        }
    }
}

/**
 * Creates a request parser that adds Bearer token authorization header
 * @param {string} token - The Bearer token to use for authorization
 * @returns {RequestParser} Request parser function
 * @throws {Error} If token is not a non-empty string
 */
export function bearerAuth(token) {
    if (!token || typeof token !== 'string') {
        throw new Error('Bearer token must be a non-empty string')
    }

    return () => ({
        headers: { Authorization: `Bearer ${token}` }
    })
}

// Response parser factories

/**
 * @template [E=DefaultErrorFormat]
 * @param {Response} response
 * @param {RequestContext} context
 * @returns {Promise<HttpErrorResult<E>>}
 */
async function handleJsonError(response, context) {
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
        /** @type {E} */
        const body = await response.json()
        /** @type {Record<string, string>} */
        const headers = Object.fromEntries(response.headers.entries())

        return {
            ok: false,
            error: {
                type: 'HTTP_ERROR',
                parsed: true,
                message: `HTTP ${response.status}: ${response.statusText}`,
                status: response.status,
                response,
                context,
                headers,
                body,
                contentType
            }
        }
    } else {
        /** @type {string} */
        const bodyText = await response.text()
        /** @type {Record<string, string>} */
        const headers = Object.fromEntries(response.headers.entries())

        return {
            ok: false,
            error: {
                type: 'HTTP_ERROR',
                parsed: false,
                message: `HTTP ${response.status}: ${response.statusText}`,
                status: response.status,
                response,
                context,
                headers,
                body: bodyText,
                reason: 'CONTENT_TYPE_MISMATCH',
                received: contentType,
                expected: 'application/json'
            }
        }
    }
}

/**
 * @template T
 * @template [E=DefaultErrorFormat]
 * @param {Response} response
 * @param {RequestContext} context
 * @returns {Promise<HttpResult<T, E>>}
 * @throws {HttpJsonError} For JSON error responses
 * @throws {HttpError} For non-JSON error responses
 */
async function parseJsonResponse(response, context) {
    if (!response.ok) return handleJsonError(response, context)

    // Content-type validation for successful responses
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
        /** @type {string} */
        const bodyText = await response.text()
        /** @type {Record<string, string>} */
        const headers = Object.fromEntries(response.headers.entries())

        return {
            ok: false,
            error: {
                type: 'HTTP_ERROR',
                parsed: false,
                reason: 'CONTENT_TYPE_MISMATCH',
                message: `Expected JSON response but got ${contentType}`,
                expected: 'application/json',
                received: contentType,
                body: bodyText,
                context: context,
                status: response.status,
                headers,
                response
            }
        }
    }

    return {
        ok: true,
        data: await response.json()
    }
}

/**
 * Creates a JSON response parser
 * @template B
 * @overload
 * @returns {ResponseParser<B>}
 */
/**
 * Creates a JSON response parser
 * @template B
 * @template [T=B]
 * @overload
 * @param {((body: B, headers: Record<string, string>) => T)?} [transformer]
 * @returns {ResponseParser<T>}
 */
/**
 * Creates a JSON response parser
 * @template B
 * @template [T=B]
 * @param {((body: B, headers: Record<string, string>) => T)?} [transformer]
 * @returns {ResponseParser<T>}
 */
export function jsonResponse(transformer) {
    if (transformer) {
        return {
            accepts: 'application/json',
            parse: async (response, context) => {
                const result = await parseJsonResponse(response, context)

                if (!result.ok) return result

                /** @type {Record<string, string>} */
                const headers = Object.fromEntries(response.headers.entries())

                const transformed = transformer(result.data, headers)

                return {
                    ok: true,
                    data: transformed
                }
            }
        }
    } else {
        return {
            accepts: 'application/json',
            parse: parseJsonResponse
        }
    }
}

/**
 * Creates a response parser for requests with no expected response body
 * @returns {ResponseParser<void>}
 */
export function noResponse() {
    return {
        accepts: '*',
        parse: async (response, context) => {
            if (!response.ok) return handleJsonError(response, context)
            return {
                ok: true,
                data: undefined
            }
        }
    }
}
