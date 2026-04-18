import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import Fastify from 'fastify'
import schemaPlugin from './plugin.js'
import z from 'zod'
import { withTypeProvider } from './type-provider.js'
import { i18n } from '@ems/domain-shared-schema'
import { errorHandling } from './error-handling.js'

const testSchema = z.object({
    email: z.email(),
    age: z.number().min(18).optional()
})

const defaultLiterals = {
    'email.invalid': 'The email is invalid',
    'age.invalid': 'Must be a number',
    'age.min': 'The minimum age is {minimum}'
}

const testI18n = i18n(defaultLiterals, {
    pt_BR: {
        'email.invalid': 'O e-mail é invalido',
        'age.invalid': 'Deve ser um número',
        'age.min': 'A idade mínima é {minumum}'
    }
})

describe('error handling plugin', () => {
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
                    body: testSchema
                },
                errorHandler: errorHandling({
                    i18n: {
                        body: testI18n
                    }
                })
            },
            () => ({ ok: true })
        )

        const response = await app.inject({
            method: 'POST',
            url: '/test',
            payload: { email: 'invalid', age: 15 }
        })

        expect(response.statusCode).toBe(400)
        expect(response.json()).toMatchObject({
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
