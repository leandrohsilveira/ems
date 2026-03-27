import Fastify from 'fastify'
import createAppConfig from '@ems/domain-backend-config'
import appPlugin from './plugin'
import { createDatabaseClient } from '@ems/database'

/**
 * Starts the API Server
 */
export default async function start() {
    const fastify = Fastify({
        logger: {
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname'
                }
            }
        }
    })

    const appConfig = createAppConfig(process.env)
    const db = createDatabaseClient(appConfig.db)

    await fastify.register(appPlugin, { appConfig, db })

    try {
        await fastify.listen({
            host: process.env.HOST || 'localhost',
            port: Number(process.env.PORT || '3000')
        })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
