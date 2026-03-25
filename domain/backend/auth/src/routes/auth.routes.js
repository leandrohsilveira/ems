import { authService } from '../services/auth.service.js'
/** @import { AuthConfig } from '@ems/types-backend-auth' */

/**
 * Create auth routes for Fastify
 * @param {AuthConfig} config - Auth configuration
 * @returns {Function} Route registration function
 */
export function createAuthRoutes(config) {
    /**
     * @param {import('fastify').FastifyInstance} fastify
     * @returns {Promise<void>}
     */
    return async (fastify) => {
        // POST /auth/login
        fastify.post(
            '/login',
            {
                schema: {
                    body: {
                        type: 'object',
                        required: ['username', 'password'],
                        properties: {
                            username: { type: 'string' },
                            password: { type: 'string' }
                        }
                    }
                }
            },
            /**
             * @param {import('fastify').FastifyRequest} request
             * @param {import('fastify').FastifyReply} reply
             */
            async (request, reply) => {
                const body = /** @type {{ username: string, password: string }} */ (request.body)
                const { username, password } = body

                try {
                    const result = await authService.login(username, password, config)
                    return result
                } catch (err) {
                    reply.code(401)
                    return { message: err instanceof Error ? err.message : 'Unknown error' }
                }
            }
        )

        // POST /auth/refresh
        fastify.post(
            '/refresh',
            {
                schema: {
                    body: {
                        type: 'object',
                        required: ['refreshToken'],
                        properties: {
                            refreshToken: { type: 'string' }
                        }
                    }
                }
            },
            /**
             * @param {import('fastify').FastifyRequest} request
             * @param {import('fastify').FastifyReply} reply
             */
            async (request, reply) => {
                const body = /** @type {{ refreshToken: string }} */ (request.body)
                const { refreshToken } = body

                try {
                    const result = await authService.refresh(refreshToken, config)
                    return result
                } catch (err) {
                    reply.code(401)
                    return { message: err instanceof Error ? err.message : 'Unknown error' }
                }
            }
        )

        // POST /auth/logout
        fastify.post(
            '/logout',
            {
                schema: {
                    body: {
                        type: 'object',
                        required: ['refreshToken'],
                        properties: {
                            refreshToken: { type: 'string' }
                        }
                    }
                }
            },
            /**
             * @param {import('fastify').FastifyRequest} request
             */
            async (request) => {
                const body = /** @type {{ refreshToken: string }} */ (request.body)
                const { refreshToken } = body
                await authService.logout(refreshToken, config)
                return { message: 'Logged out successfully' }
            }
        )

        // POST /auth/revoke-all
        fastify.post(
            '/revoke-all',
            {
                schema: {
                    body: {
                        type: 'object',
                        required: ['userId'],
                        properties: {
                            userId: { type: 'string' }
                        }
                    }
                }
            },
            /**
             * @param {import('fastify').FastifyRequest} request
             */
            async (request) => {
                const body = /** @type {{ userId: string }} */ (request.body)
                const { userId } = body
                await authService.revokeAll(userId)
                return { message: 'All tokens revoked' }
            }
        )

        // GET /auth/me - Protected route
        fastify.get(
            '/me',
            {
                /**
                 * @param {import('fastify').FastifyRequest} request
                 * @param {import('fastify').FastifyReply} reply
                 */
                preHandler: async (request, reply) => {
                    const authHeader = request.headers.authorization
                    if (!authHeader) {
                        reply.code(401)
                        return { message: 'Unauthorized' }
                    }

                    const token = authHeader.replace('Bearer ', '')
                    try {
                        const user = await authService.verifyAccessToken(token, config)
                        const req =
                            /** @type {{ user?: { userId: string, username: string, roles: string[] } }} */ (
                                request
                            )
                        req.user = user
                    } catch (err) {
                        reply.code(401)
                        return { message: err instanceof Error ? err.message : 'Unknown error' }
                    }
                }
            },
            /**
             * @param {import('fastify').FastifyRequest} request
             */
            async (request) => {
                const req =
                    /** @type {{ user?: { userId: string, username: string, roles: string[] } }} */ (
                        request
                    )
                return req.user
            }
        )
    }
}
