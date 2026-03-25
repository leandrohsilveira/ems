import { createAuthRoutes } from './routes/auth.routes.js'
/** @import { AuthConfig } from '@ems/types-backend-auth' */

/**
 * Auth plugin for Fastify
 * @param {import('fastify').FastifyInstance} fastify
 * @param {AuthConfig} options
 */
export default async function authPlugin(fastify, options) {
    const config = {
        jwtSecret: options.jwtSecret,
        accessTokenTtl: options.accessTokenTtl || 900,
        refreshTokenTtl: options.refreshTokenTtl || 604800
    }

    if (!config.jwtSecret) {
        throw new Error('jwtSecret is required for auth plugin')
    }

    const authRoutes = createAuthRoutes(config)
    await authRoutes(fastify)
}

export { authService } from './services/auth.service.js'
export { userStore, seedUsers } from './services/user.store.js'
export { tokenStore, clearTokens } from './services/token.store.js'
export { authMiddleware } from './middleware/auth.middleware.js'
export { createAuthRoutes } from './routes/auth.routes.js'
