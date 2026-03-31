import Fastify from 'fastify'
import start from './server'

export const app = Fastify({
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

await start(app, import.meta.env.PROD)
