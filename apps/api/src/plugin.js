import authPlugin from '@ems/domain-backend-auth'

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
export default async function appPlugin(fastify, { appConfig }) {
    fastify.get('/', helloWorldOptions, async () => {
        return { message: 'Hello World' }
    })

    await fastify.register(authPlugin, {
        prefix: '/auth',
        config: appConfig.auth
    })
}
