import { vi } from 'vitest'

/**
 * Mocks the fetch function to return a specific Response
 * @param {object} options
 * @param {Response} options.response - The Response to return from fetch
 * @returns {import('vitest').Mock} Mocked fetch function
 */
export function mockFetchWithResponse({ response }) {
    return vi.fn().mockResolvedValue(response)
}

/**
 * Mocks the fetch function to return a JSON Response
 * @param {object} options
 * @param {unknown} options.body - JSON body to return
 * @param {number} [options.status=200] - HTTP status code
 * @param {string} [options.statusText='OK'] - HTTP status text
 * @returns {import('vitest').Mock} Mocked fetch function
 */
export function mockFetchWithJson({ body, status = 200, statusText = 'OK' }) {
    const response = new Response(JSON.stringify(body), {
        status,
        statusText,
        headers: { 'content-type': 'application/json' }
    })

    response.json = vi.fn().mockResolvedValue(body)
    return vi.fn().mockResolvedValue(response)
}

/**
 * Mocks the fetch function to return a text Response
 * @param {object} options
 * @param {string} options.text - Text body to return
 * @param {number} [options.status=200] - HTTP status code
 * @param {string} [options.statusText='OK'] - HTTP status text
 * @param {string} [options.contentType='text/plain'] - Content-Type header
 * @returns {import('vitest').Mock} Mocked fetch function
 */
export function mockFetchWithText({
    text,
    status = 200,
    statusText = 'OK',
    contentType = 'text/plain'
}) {
    const response = new Response(text, {
        status,
        statusText,
        headers: { 'content-type': contentType }
    })

    response.text = vi.fn().mockResolvedValue(text)
    return vi.fn().mockResolvedValue(response)
}
