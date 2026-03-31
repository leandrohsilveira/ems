import '@ems/types-backend-auth'
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

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 * @param {import('@ems/types-backend-auth').AuthService} options.authService - the auth service
 */
export default async function appPlugin(fastify, { authService }) {
    await fastify.register(authPlugin, {
        prefix: '/auth',
        authService
    })

    fastify.get('/', helloWorldOptions, async () => {
        return { message: 'Hello World' }
    })
}
