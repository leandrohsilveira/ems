import Fastify from 'fastify'

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

/** @type {import('fastify').RouteShorthandOptions} */
const helloWorldOptions = {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                }
            }
        }
    }
}

fastify.get('/', helloWorldOptions, async () => {
    return { message: 'Hello World' }
})

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
