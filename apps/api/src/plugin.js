import '@ems/types-backend-auth'
import authPlugin, {
    createUserRepository,
    createSessionRepository,
    createTokenService,
    createAuthService,
    authMiddleware
} from '@ems/domain-backend-auth'

/** @import { PrismaClient } from '@ems/database' */

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
 * @param {PrismaClient} options.db The database client
 */
export default async function appPlugin(fastify, { appConfig, db }) {
    const userRepository = createUserRepository(db)
    const sessionRepository = createSessionRepository(db)
    const tokenService = createTokenService(appConfig.auth)
    const authService = createAuthService(
        userRepository,
        sessionRepository,
        tokenService,
        appConfig.auth
    )

    await fastify.register(authMiddleware, { authService })
    await fastify.register(authPlugin, { prefix: '/auth', db, config: appConfig.auth })

    fastify.get('/', helloWorldOptions, async () => {
        return { message: 'Hello World' }
    })
}
