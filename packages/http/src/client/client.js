import { asArray } from '@ems/utils'
import { defaultLiterals } from './literals.js'

/** @import { DefaultErrorFormat, HttpClient, HttpClientOptions, HttpResult, RequestContext, RequestMethod, RequestOptions, RequestParserInput, RequestParserResult, ResponseParser } from "./types.js" */

// Main createHttpClient function

/**
 * Creates an HTTP client for making API requests
 * @template [DefErr=DefaultErrorFormat]
 * @param {Window['fetch']} fetch - The fetch function to use for HTTP requests
 * @param {HttpClientOptions} [options={}]
 * @returns {HttpClient<DefErr>} Configured HTTP client instance
 * @throws {Error} If API_URL is not set in env
 */
export function createHttpClient(
    fetch,
    { baseUrl = '', request: clientRequestParsers = [], literals = defaultLiterals } = {}
) {
    // Store base URL
    const baseApiUrl = baseUrl.replace(/\/$/, '')

    /**
     * @template T
     * @template [E=DefErr]
     * @param {RequestMethod} method
     * @param {string} url
     * @param {RequestOptions<T, E>} options
     * @returns {Promise<HttpResult<T, E>>}
     * @throws {NetworkError} For network failures
     * @throws {HttpError|HttpJsonError} For HTTP error responses
     * @throws {Error} For other errors (missing response parser, etc.)
     */
    async function call(method, url, options) {
        // Build request context for error reporting
        /** @type {RequestContext} */
        const requestContext = {
            url: `${baseApiUrl}${url}`,
            method,
            headers: {}
        }

        try {
            // 1. Evaluate request parsers once
            /** @type {RequestParserResult[]} */
            const parserResults = await evaluateParserInputs([
                ...asArray(clientRequestParsers),
                ...asArray(options.request)
            ])

            // 2. Collect Accept headers using already-evaluated results
            const acceptHeader = collectAcceptHeaders(parserResults, options.response)

            // 3. Apply parser results with initial Accept header
            const initialParams = {
                headers: acceptHeader ? { Accept: acceptHeader } : {},
                query: {},
                body: undefined
            }

            const requestParams = applyParserResults(parserResults, initialParams)

            // Update request context with final headers
            requestContext.headers = { ...requestParams.headers }
            requestContext.query = { ...requestParams.query }

            // 4. Build URL with query params
            const urlWithQuery = buildUrl(url, requestParams.query ?? {}, baseApiUrl)

            // 5. Make fetch request - NetworkError on failure
            const response = await fetch(urlWithQuery, {
                method,
                headers: /** @type {[string, string][]} */ (
                    Object.entries(requestParams.headers || {}).filter(
                        ([, value]) => value !== null && value !== undefined
                    )
                ),
                body: requestParams.body
            })

            // 6. Apply response parser - HttpError/HttpJsonError on failure
            return options.response.parse(response, requestContext)
        } catch (error) {
            if (isNetworkError(error))
                return {
                    ok: false,
                    error: {
                        type: 'NETWORK_ERROR',
                        message: literals.serviceUnavailableError,
                        context: requestContext
                    }
                }

            console.error(error)

            return {
                ok: false,
                error: {
                    type: 'UNEXPECTED_ERROR',
                    message: literals.somethingWentWrongError,
                    context: requestContext
                }
            }
        }
    }

    // Create HTTP method aliases
    /** @type {HttpClient} */
    return {
        call,
        get: (url, options) => call('GET', url, options),
        post: (url, options) => call('POST', url, options),
        put: (url, options) => call('PUT', url, options),
        patch: (url, options) => call('PATCH', url, options),
        delete: (url, options) => call('DELETE', url, options),
        head: (url, options) => call('HEAD', url, options),
        options: (url, options) => call('OPTIONS', url, options)
    }
}

// Helper functions

/**
 * Evaluates request parser inputs (functions or objects) to get results
 * @param {RequestParserInput | RequestParserInput[]} parserInputs
 * @returns {Promise<RequestParserResult[]>}
 */
async function evaluateParserInputs(parserInputs) {
    /** @type {RequestParserResult[]} */
    const results = []
    const inputs = Array.isArray(parserInputs) ? parserInputs : [parserInputs]

    for (const input of inputs) {
        /** @type {RequestParserResult} */
        const result =
            typeof input === 'function'
                ? await input() // Evaluate RequestParser function
                : input // Use RequestParserResult object directly

        results.push(result)
    }

    return results
}

/**
 * Collects and merges Accept headers from response parser and request parser results
 * @template E
 * @param {RequestParserResult[]} parserResults
 * @param {ResponseParser<unknown, E>} [responseParser]
 * @returns {string|undefined} Merged Accept header value
 */
function collectAcceptHeaders(parserResults, responseParser) {
    /** @type {Set<string>} */
    const acceptSet = new Set()

    // Add Accept headers from response parser
    if (responseParser?.accepts) {
        const accepts = Array.isArray(responseParser.accepts)
            ? responseParser.accepts
            : [responseParser.accepts]
        accepts.forEach((accept) => acceptSet.add(accept))
    }

    // Add Accept headers from already-evaluated parser results
    parserResults.forEach((result) => {
        if (result?.headers?.Accept) {
            const accepts = result.headers.Accept.split(',').map((a) => a.trim())
            accepts.forEach((accept) => acceptSet.add(accept))
        }
    })

    return acceptSet.size > 0 ? Array.from(acceptSet).join(', ') : undefined
}

/**
 * Applies parser results to build final request parameters
 * @param {RequestParserResult[]} parserResults
 * @param {RequestParserResult} initialParams
 * @returns {RequestParserResult}
 */
function applyParserResults(parserResults, initialParams) {
    /** @type {RequestParserResult} */
    let result = { ...initialParams }

    for (const parsed of parserResults) {
        // Merge headers (excluding Accept which is handled separately)
        // eslint-disable-next-line no-unused-vars
        const { Accept: _, ...otherHeaders } = parsed.headers || {}
        result.headers = { ...result.headers, ...otherHeaders }

        // Merge query params
        result.query = { ...result.query, ...parsed.query }

        // Body: replace if provided
        if (parsed.body !== undefined) {
            result.body = parsed.body
        }
    }

    return result
}

/**
 * Builds URL with query parameters
 * @param {string} baseUrl
 * @param {Record<string, string[] | string | null | undefined>} queryParams
 * @param {string} apiBaseUrl
 * @returns {string}
 */
function buildUrl(baseUrl, queryParams, apiBaseUrl) {
    const url = new URL(baseUrl, apiBaseUrl)

    // Add query parameters
    if (queryParams && Object.keys(queryParams).length > 0) {
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                return
            }

            if (Array.isArray(value)) {
                value.forEach((item) => {
                    if (item !== null && item !== undefined) {
                        url.searchParams.append(key, String(item))
                    }
                })
            } else {
                url.searchParams.append(key, String(value))
            }
        })
    }

    return url.toString()
}

/**
 * @param {unknown} error
 */
function isNetworkError(error) {
    return (
        error instanceof Error &&
        error.cause instanceof Error &&
        'code' in error.cause &&
        error.cause.code === 'ECONNREFUSED'
    )
}
