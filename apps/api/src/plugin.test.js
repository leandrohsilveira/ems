import { describe, it, expect } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import Fastify from 'fastify'
import appPlugin from './plugin.js'

describe('Hello World endpoint', () => {
    it('GET / returns Hello World message', async () => {
        const mockDb = mockDeep()

        /** @type {import('@ems/types-backend-config').AppConfig} */
        const appConfig = {
            auth: {
                jwtSecret: 'test-secret',
                accessTokenTTL: 300,
                refreshTokenTTL: 3600,
                refreshTokenMobileTTL: 86400
            },
            db: { url: ':memory:' }
        }
        const fastify = Fastify()
        await fastify.register(appPlugin, {
            appConfig,
            db: mockDb
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
