import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import Fastify from 'fastify'
import schemaPlugin from './plugin.js'
import z from 'zod'
import { withTypeProvider } from './type-provider.js'

describe('errorHandling plugin', () => {
    /** @type {import('fastify').FastifyInstance} */
    let fastify

    beforeEach(async () => {
        fastify = Fastify()
        await fastify.register(schemaPlugin)
    })

    afterEach(async () => {
        await fastify.close()
    })

    test('handles Fastify schema validation errors with 400 status', async () => {
        const app = withTypeProvider(fastify)
        app.post(
            '/test',
            {
                schema: {
                    body: z.object({
                        email: z.email('The email is invalid'),
                        age: z
                            .number('Must be a number')
                            .min(18, 'The minimum age is 18')
                            .optional()
                    })
                }
            },
            () => ({ ok: true })
        )

        const response = await app.inject({
            method: 'POST',
            url: '/test',
            payload: { email: 'invalid', age: 15 }
        })

        expect(response.statusCode).toBe(400)
        expect(response.json()).toEqual({
            fields: {
                email: ['The email is invalid'],
                age: ['The minimum age is 18']
            }
        })
    })

    test('handles not found routes with 404 status', async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: '/non-existent-route'
        })

        expect(response.statusCode).toBe(404)
        const body = JSON.parse(response.payload)
        expect(body).toEqual({ message: 'Route not found' })
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
        expect(body).toEqual({ message: 'Test error' })
    })
})
