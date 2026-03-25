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

/** @import { AppConfig } from '@ems/types-backend-config' */

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 * @param {AppConfig} options.appConfig - Required app configuration
 */
export default async function appPlugin(fastify, options) {
    fastify.get('/', helloWorldOptions, async () => {
        return { message: 'Hello World' }
    })

    await fastify.register(import('@ems/domain-backend-auth'), {
        prefix: '/auth',
        jwtSecret: options.appConfig.jwtSecret
    })
}
