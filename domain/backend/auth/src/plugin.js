import authMiddleware from './auth.middleware.js'
import { getErrorMessage } from './utils/error.js'

/**
 * Auth plugin for Fastify
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 * @param {import('@ems/types-backend-auth').AuthService} options.authService
 * @param {import('@ems/types-backend-auth').UserService} options.userService
 */
export default async function authPlugin(fastify, { authService, userService }) {
    await fastify.register(authMiddleware, { authService })

    // Endpoint de login (não precisa de autenticação)
    fastify.post('/login', {
        schema: {
            body: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                    username: { type: 'string' },
                    password: { type: 'string' }
                }
            }
        },
        handler: async (request, reply) => {
            try {
                const result = await authService.login(
                    /** @type {import('@ems/types-shared-auth').LoginRequestDTO} */ (request.body)
                )
                return reply.send(result)
            } catch (error) {
                return reply.status(401).send({ error: getErrorMessage(error) })
            }
        }
    })

    // Endpoint de signup (não precisa de autenticação)
    fastify.post('/signup', {
        schema: {
            body: {
                type: 'object',
                required: ['username', 'email', 'password', 'firstName', 'lastName'],
                properties: {
                    username: { type: 'string', minLength: 3, maxLength: 30 },
                    email: { type: 'string', format: 'email', maxLength: 255 },
                    password: { type: 'string', minLength: 8, maxLength: 128 },
                    firstName: { type: ['string', 'null'], maxLength: 100 },
                    lastName: { type: ['string', 'null'], maxLength: 100 }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        firstName: { type: ['string', 'null'] },
                        lastName: { type: ['string', 'null'] },
                        role: { type: 'string' }
                    },
                    required: ['userId', 'username', 'email', 'firstName', 'lastName', 'role']
                },
                400: {
                    type: 'object',
                    properties: {
                        errors: {
                            type: 'object',
                            additionalProperties: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string' }
                                },
                                required: ['message']
                            }
                        }
                    },
                    required: ['errors']
                },
                409: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    },
                    required: ['error']
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    },
                    required: ['error']
                }
            }
        },
        handler: async (request, reply) => {
            try {
                const result = await userService.signup(
                    /** @type {import('@ems/types-shared-auth').SignUpRequestDTO} */ (request.body)
                )
                return reply.status(201).send(result)
            } catch (error) {
                // Type-safe error handling
                if (error instanceof Error) {
                    // Check for duplicate user error
                    if (error.message.includes('already exists')) {
                        return reply.status(409).send({ error: error.message })
                    }
                }

                // Generic error handling
                return reply.status(500).send({ error: getErrorMessage(error) })
            }
        }
    })

    // Endpoint de refresh (não precisa de autenticação)
    fastify.post('/refresh', {
        schema: {
            body: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                    refreshToken: { type: 'string' }
                }
            }
        },
        handler: async (request, reply) => {
            try {
                const result = await authService.refresh(
                    /** @type {import('@ems/types-shared-auth').RefreshRequestDTO} */ (request.body)
                )
                return reply.send(result)
            } catch (error) {
                return reply.status(401).send({ error: getErrorMessage(error) })
            }
        }
    })

    // Endpoint de logout (não precisa de autenticação)
    fastify.post('/logout', {
        schema: {
            body: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                    refreshToken: { type: 'string' }
                }
            }
        },
        handler: async (request, reply) => {
            try {
                const result = await authService.logout(
                    /** @type {import('@ems/types-shared-auth').RefreshRequestDTO} */ (request.body)
                )
                return reply.send(result)
            } catch (error) {
                return reply.status(401).send({ error: getErrorMessage(error) })
            }
        }
    })

    // Endpoint para revogar todas as sessões do usuário (REQUER autenticação)
    fastify.post('/revoke-all', {
        preHandler: fastify.authenticate,
        schema: {
            body: {
                type: 'object',
                required: ['userId'],
                properties: {
                    userId: { type: 'string' }
                }
            }
        },
        handler: async (request, reply) => {
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
    })

    // Endpoint para obter informações do usuário atual (REQUER autenticação)
    fastify.get('/me', {
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            return reply.send({ user: request.user })
        }
    })
}
