import { describe, it, expect } from 'vitest'
import Fastify from 'fastify'
import appPlugin from './plugin.js'

describe('Hello World endpoint', () => {
    it('GET / returns Hello World message', async () => {
        const fastify = Fastify()
        await fastify.register(appPlugin, {
            appConfig: {
                auth: { jwtSecret: 'test-secret' }
            }
        })
        await fastify.ready()

        const response = await fastify.inject({
            method: 'GET',
            url: '/'
        })

        expect(response.statusCode).toBe(200)
        expect(response.json()).toEqual({ message: 'Hello World' })
    })
})
