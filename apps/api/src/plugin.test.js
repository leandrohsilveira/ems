import { describe, it, expect } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import Fastify from 'fastify'
import appPlugin from './plugin.js'

describe('Hello World endpoint', () => {
    it('GET / returns Hello World message', async () => {
        const authService = mockDeep()

        const fastify = Fastify()
        await fastify.register(appPlugin, { authService })
        await fastify.ready()

        const response = await fastify.inject({
            method: 'GET',
            url: '/'
        })

        expect(response.statusCode).toBe(200)
        expect(response.json()).toEqual({ message: 'Hello World' })
    })
})
