import createAppConfig from '@ems/domain-backend-config'
import appPlugin from './plugin'
import { createDatabaseClient } from '@ems/database'

/**
 * Starts the API Server
 * @param {import('fastify').FastifyInstance} fastify
 * @param {boolean} isProd
 */
export default async function start(fastify, isProd) {
    try {
        const appConfig = createAppConfig(process.env)
        const db = createDatabaseClient(appConfig.db)

        await fastify.register(appPlugin, { appConfig, db })

        if (isProd)
            await fastify.listen({
                host: process.env.HOST || 'localhost',
                port: Number(process.env.PORT || '3000')
            })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
