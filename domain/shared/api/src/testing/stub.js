import { vi } from 'vitest'
import { createHttpClient } from '../client/client.js'

/**
 * @import { Mock } from "vitest"
 * @import { HttpClient, HttpClientOptions } from "../client/index.js"
 */

/**
 * @exports @typedef HttpClientStub
 * @property {HttpClient} client
 * @property {Mock<(typeof globalThis)['fetch']>} fetch
 */

/**
 * @param {HttpClientOptions} [options={}]
 * @returns {HttpClientStub}
 */
export function createHttpClientStub({ baseUrl = 'http://localhost', ...options } = {}) {
    /** @type {Mock<(typeof globalThis)['fetch']>} */
    const fetch = vi.fn()

    return {
        client: createHttpClient(fetch, { baseUrl, ...options }),
        fetch
    }
}
