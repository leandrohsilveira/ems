/**
 * @param {string} code
 * @returns {Error}
 */
export function createNetworkError(code) {
    /** @type {Error & { code?: string }} */
    const cause = new Error(code)
    cause.code = code

    return new Error('Network error', { cause })
}
