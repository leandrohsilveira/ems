import { describe, it, expect } from 'vitest'
import Fastify from 'fastify'
import authPlugin from './plugin.js'

describe('Auth plugin', () => {
    it('POST /login returns tokens for valid credentials', async () => {
        const fastify = Fastify()
        await fastify.register(authPlugin, { jwtSecret: 'test-secret-key' })
        await fastify.ready()

        const response = await fastify.inject({
            method: 'POST',
            url: '/login',
            payload: {
                username: 'admin',
                password: 'admin123'
            }
        })

        expect(response.statusCode).toBe(200)
        const body = response.json()
        expect(body.accessToken).toBeTruthy()
        expect(body.refreshToken).toBeTruthy()
        expect(body.expiresIn).toBe(900)
    })

    it('POST /login returns 401 for invalid credentials', async () => {
        const fastify = Fastify()
        await fastify.register(authPlugin, { jwtSecret: 'test-secret-key' })
        await fastify.ready()

        const response = await fastify.inject({
            method: 'POST',
            url: '/login',
            payload: {
                username: 'admin',
                password: 'wrongpassword'
            }
        })

        expect(response.statusCode).toBe(401)
    })

    it('GET /me returns 401 without auth header', async () => {
        const fastify = Fastify()
        await fastify.register(authPlugin, { jwtSecret: 'test-secret-key' })
        await fastify.ready()

        const response = await fastify.inject({
            method: 'GET',
            url: '/me'
        })

        expect(response.statusCode).toBe(401)
    })
})
