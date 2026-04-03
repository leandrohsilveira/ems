import { vi } from 'vitest'

/**
 * Creates a Response object with JSON body
 * @param {object} options
 * @param {unknown} options.body - The data to serialize as JSON
 * @param {number} [options.status=200] - HTTP status code
 * @param {string} [options.statusText='OK'] - HTTP status text
 * @param {Record<string, string>} [options.headers={}] - Additional headers
 * @returns {Response} Response object with JSON body
 */
export function createJsonResponse({ body, status = 200, statusText = 'OK', headers = {} }) {
    const response = new Response(JSON.stringify(body), {
        status,
        statusText,
        headers: {
            'content-type': 'application/json',
            ...headers
        }
    })

    // Mock json() to return the body (real Response.json() throws for error status)
    response.json = vi.fn().mockResolvedValue(body)
    return response
}

/**
 * Creates a Response object with text body
 * @param {object} options
 * @param {string} options.text - The text body
 * @param {number} [options.status=200] - HTTP status code
 * @param {string} [options.statusText='OK'] - HTTP status text
 * @param {string} [options.contentType='text/plain'] - Content-Type header
 * @param {Record<string, string>} [options.headers={}] - Additional headers
 * @returns {Response} Response object with text body
 */
export function createTextResponse({
    text,
    status = 200,
    statusText = 'OK',
    contentType = 'text/plain',
    headers = {}
}) {
    const response = new Response(text, {
        status,
        statusText,
        headers: {
            'content-type': contentType,
            ...headers
        }
    })

    // Mock text() to return the text
    response.text = vi.fn().mockResolvedValue(text)
    return response
}

/**
 * Creates a mock Response with controlled method behavior
 * @param {object} [options={}]
 * @param {unknown} [options.json] - JSON body to return from json() method
 * @param {string} [options.text] - Text body to return from text() method
 * @param {number} [options.status=200] - HTTP status code
 * @param {string} [options.statusText='OK'] - HTTP status text
 * @param {string} [options.contentType] - Content-Type header (inferred if not provided)
 * @param {Record<string, string>} [options.headers={}] - Additional headers
 * @returns {Response} Mock Response with controlled methods
 */
export function createMockResponse(options = {}) {
    const { json, text, status = 200, statusText = 'OK', contentType, headers = {} } = options

    // Determine body and content type
    const hasJson = json !== undefined
    const hasText = text !== undefined
    const body = hasText ? text : JSON.stringify(json || {})

    // Infer content type if not provided
    const finalContentType = contentType || (hasJson ? 'application/json' : 'text/plain')

    const response = new Response(body, {
        status,
        statusText,
        headers: {
            'content-type': finalContentType,
            ...headers
        }
    })

    // Mock json() method if json provided
    if (hasJson) {
        response.json = vi.fn().mockResolvedValue(json)
    } else {
        vi.spyOn(response, 'json')
    }

    // Mock text() method if text provided
    if (hasText) {
        response.text = vi.fn().mockResolvedValue(text)
    } else {
        vi.spyOn(response, 'text')
    }

    return response
}
