import { authService } from '../services/auth.service.js'
/** @import { AuthConfig } from '@ems/types-backend-auth' */

/**
 * Auth middleware for Fastify
 */
export const authMiddleware = {
    /**
     * Extract Bearer token from request
     * @param {import('fastify').FastifyRequest} request
     * @returns {string|null}
     */
    extractToken(request) {
        const authHeader = request.headers?.authorization
        if (!authHeader) {
            return null
        }

        const parts = authHeader.split(' ')
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null
        }

        return parts[1]
    },

    /**
     * Create authentication hook for Fastify
     * @param {AuthConfig} config
     * @returns {Function}
     */
    createAuthHook(config) {
        return async (/** @type {import('fastify').FastifyRequest} */ request) => {
            const token = this.extractToken(request)
            if (!token) {
                return { isAuthenticated: false }
            }

            try {
                const user = await authService.verifyAccessToken(token, config)
                return { isAuthenticated: true, user }
            } catch {
                return { isAuthenticated: false }
            }
        }
    },

    /**
     * Require authentication - throws if not authenticated
     * @param {import('fastify').FastifyRequest} request
     * @param {AuthConfig} config
     * @returns {Object}
     * @throws {Error} If not authenticated
     */
    requireAuth(request, config) {
        const token = this.extractToken(request)
        if (!token) {
            throw new Error('Authentication required')
        }

        return authService.verifyAccessToken(token, config)
    }
}
