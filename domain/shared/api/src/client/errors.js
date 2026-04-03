/** @import { RequestContext } from "@ems/types-shared-api" */

/**
 * Network error for fetch failures
 * @extends {Error}
 */
export class NetworkError extends Error {
    static name = 'NetworkError'

    /**
     * @param {string} message
     * @param {RequestContext} request
     * @param {unknown} [cause]
     */
    constructor(message, request, cause) {
        super(message, { cause })
        this.request = request
        this.name = NetworkError.name
    }

    /**
     * @param {unknown} value
     * @returns {value is NetworkError}
     */
    static is(value) {
        return (
            value instanceof NetworkError ||
            (value !== null &&
                typeof value === 'object' &&
                'name' in value &&
                value.name === NetworkError.name)
        )
    }
}

/**
 * HTTP error for non-2xx responses
 * @extends {Error}
 */
export class HttpError extends Error {
    static name = 'HttpError'

    /**
     * @param {string} message
     * @param {Response} response
     * @param {string} bodyText
     * @param {Record<string, string>} headers
     * @param {RequestContext} [request]
     */
    constructor(message, response, bodyText, headers, request) {
        super(message)
        this.response = response
        this.bodyText = bodyText
        this.headers = headers
        this.status = response?.status
        this.statusText = response?.statusText
        this.request = request
        this.name = HttpError.name
    }

    /**
     * @param {unknown} value
     * @returns {value is HttpError}
     */
    static is(value) {
        return (
            value instanceof HttpError ||
            (value !== null &&
                typeof value === 'object' &&
                'name' in value &&
                value.name === HttpError.name)
        )
    }
}

/**
 * HTTP error specifically for JSON error responses
 * @extends {HttpError}
 */
export class HttpJsonError extends HttpError {
    static name = 'HttpJsonError'

    /**
     * @param {string} message
     * @param {Response} response
     * @param {unknown} body
     * @param {Record<string, string>} headers
     * @param {RequestContext} [request]
     */
    constructor(message, response, body, headers, request) {
        super(message, response, '', headers, request)
        this.body = body
        this.name = HttpJsonError.name
    }

    /**
     * @template T
     * @returns T
     */
    getBody() {
        return /** @type {T} */ (this.body)
    }

    /**
     * @param {unknown} value
     * @returns {value is HttpJsonError}
     */
    static is(value) {
        return (
            value instanceof HttpJsonError ||
            (value !== null &&
                typeof value === 'object' &&
                'name' in value &&
                value.name === HttpJsonError.name)
        )
    }
}
