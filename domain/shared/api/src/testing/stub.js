import { vi } from 'vitest'
import { createHttpClient } from '../client/client.js'

/**
 * @exports @typedef HttpClientStub
 * @property {import('@ems/types-shared-api').HttpClient} client
 * @property {import('vitest').Mock<(typeof globalThis)['fetch']>} fetch
 */

/**
 * @param {import('@ems/types-shared-api').HttpClientOptions} [options={}]
 * @returns {HttpClientStub}
 */
export function createHttpClientStub({ baseUrl = 'http://localhost', ...options } = {}) {
    /** @type {import("vitest").Mock<(typeof globalThis)['fetch']>} */
    const fetch = vi.fn()

    return {
        client: createHttpClient(fetch, { baseUrl, ...options }),
        fetch
    }
}
