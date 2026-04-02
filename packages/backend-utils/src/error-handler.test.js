import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import Fastify from 'fastify'
import { errorHandling } from './index.js'

describe('errorHandling plugin', () => {
    /** @type {import('fastify').FastifyInstance} */
    let fastify

    beforeEach(async () => {
        fastify = Fastify()
        await fastify.register(errorHandling)
    })

    afterEach(async () => {
        await fastify.close()
    })

    test('handles Fastify schema validation errors with 400 status', async () => {
        fastify.post(
            '/test',
            {
                schema: {
                    body: {
                        type: 'object',
                        required: ['email'],
                        properties: {
                            email: { type: 'string', format: 'email' },
                            age: { type: 'number', minimum: 18 }
                        }
                    }
                }
            },
            () => ({ ok: true })
        )

        const response = await fastify.inject({
            method: 'POST',
            url: '/test',
            payload: { email: 'invalid', age: 15 }
        })

        expect(response.statusCode).toBe(400)
        const body = JSON.parse(response.payload)
        expect(body).toHaveProperty('errors')
        expect(typeof body.errors).toBe('object')
    })

    test('handles not found routes with 404 status', async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: '/non-existent-route'
        })

        expect(response.statusCode).toBe(404)
        const body = JSON.parse(response.payload)
        expect(body).toEqual({ error: 'Route not found' })
    })

    test('handles generic errors with 500 status', async () => {
        fastify.get('/error', () => {
            throw new Error('Test error')
        })

        const response = await fastify.inject({
            method: 'GET',
            url: '/error'
        })

        expect(response.statusCode).toBe(500)
        const body = JSON.parse(response.payload)
        expect(body).toEqual({ error: 'Test error' })
    })
})
