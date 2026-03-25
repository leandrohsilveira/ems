import Fastify from 'fastify'
import createAppConfig from '@ems/domain-backend-config'

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
    await fastify.register(import('./plugin.js'), { appConfig })

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
