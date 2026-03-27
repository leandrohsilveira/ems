import { describe, it, expect, vi } from 'vitest'
import Fastify from 'fastify'
import appPlugin from './plugin.js'
import { PrismaClient } from '@ems/database'

describe('Hello World endpoint', () => {
    it('GET / returns Hello World message', async () => {
        const MockedClient = vi.mockObject(PrismaClient)

        /** @type {import('@ems/types-backend-config').AppConfig} */
        const appConfig = {
            auth: { jwtSecret: 'test-secret' },
            db: { url: ':memory:' }
        }
        const fastify = Fastify()
        await fastify.register(appPlugin, {
            appConfig,
            db: new MockedClient({ adapter: vi.mockObject(/** @type {*} */ ({})) })
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
