import '@ems/types-backend-auth'
import authPlugin from '@ems/domain-backend-auth'
import { errorHandling } from '@ems/backend-utils'

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
 * @param {import('@ems/types-backend-auth').UserService} options.userService - the user service
 */
export default async function appPlugin(fastify, { authService, userService }) {
    // Register error handling plugin FIRST
    await fastify.register(errorHandling)
    await fastify.register(authPlugin, {
        prefix: '/auth',
        authService,
        userService
    })

    fastify.get('/', helloWorldOptions, async () => {
        return { message: 'Hello World' }
    })
}
