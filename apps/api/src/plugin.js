import authPlugin from '@ems/domain-backend-auth'
import { messageDtoSchema } from '@ems/domain-shared-schema'
import schemaPlugin, { withTypeProvider } from '@ems/domain-backend-schema'

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 * @param {import('@ems/domain-backend-auth').AuthService} options.authService - the auth service
 * @param {import('@ems/domain-backend-auth').UserService} options.userService - the user service
 */
export default async function appPlugin(fastify, { authService, userService }) {
    const app = withTypeProvider(fastify)
    await app.register(schemaPlugin)
    await app.register(authPlugin, {
        prefix: '/auth',
        authService,
        userService
    })

    app.get('/', {
        schema: {
            response: {
                200: messageDtoSchema
            }
        },
        handler: async () => {
            return { message: 'Hello World' }
        }
    })
}
