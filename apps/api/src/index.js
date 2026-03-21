import Fastify from 'fastify'
import appPlugin from './plugin.js'

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

await fastify.register(appPlugin)

const start = async () => {
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

start()
