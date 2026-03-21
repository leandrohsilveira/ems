import { describe, it, expect } from 'vitest'
import Fastify from 'fastify'
import authPlugin from './plugin.js'

describe('Auth plugin', () => {
    it('GET /hello returns Hello from auth message', async () => {
        const fastify = Fastify()
        await fastify.register(authPlugin)
        await fastify.ready()

        const response = await fastify.inject({
            method: 'GET',
            url: '/hello'
        })

        expect(response.statusCode).toBe(200)
        expect(response.json()).toEqual({ message: 'Hello from auth' })
    })
})
