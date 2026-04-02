import authMiddleware from './auth.middleware.js'
import { getErrorMessage } from './utils/error.js'

/**
 * Auth plugin for Fastify
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 * @param {import('@ems/types-backend-auth').AuthService} options.authService
 */
export default async function authPlugin(fastify, { authService }) {
    await fastify.register(authMiddleware, { authService })

    // Endpoint de login (não precisa de autenticação)
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
        async (request, reply) => {
            try {
                const result = await authService.login(
                    /** @type {import('@ems/types-shared-auth').LoginRequestDTO} */ (request.body)
                )
                return reply.send(result)
            } catch (error) {
                return reply.status(401).send({ error: getErrorMessage(error) })
            }
        }
    )

    // Endpoint de refresh (não precisa de autenticação)
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
        async (request, reply) => {
            try {
                const result = await authService.refresh(
                    /** @type {import('@ems/types-shared-auth').RefreshRequestDTO} */ (request.body)
                )
                return reply.send(result)
            } catch (error) {
                return reply.status(401).send({ error: getErrorMessage(error) })
            }
        }
    )

    // Endpoint de logout (não precisa de autenticação)
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
        async (request, reply) => {
            try {
                const result = await authService.logout(
                    /** @type {import('@ems/types-shared-auth').RefreshRequestDTO} */ (request.body)
                )
                return reply.send(result)
            } catch (error) {
                return reply.status(401).send({ error: getErrorMessage(error) })
            }
        }
    )

    // Endpoint para revogar todas as sessões do usuário (REQUER autenticação)
    fastify.post(
        '/revoke-all',
        {
            preHandler: fastify.authenticate,
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
        async (request, reply) => {
            try {
                const result = await authService.revokeAll(
                    /** @type {import('@ems/types-shared-auth').RevokeAllRequestDTO} */ (
                        request.body
                    ).userId
                )
                return reply.send(result)
            } catch (error) {
                return reply.status(400).send({ error: getErrorMessage(error) })
            }
        }
    )

    // Endpoint para obter informações do usuário atual (REQUER autenticação)
    fastify.get(
        '/me',
        {
            preHandler: fastify.authenticate
        },
        async (request, reply) => {
            return reply.send({ user: request.user })
        }
    )
}
