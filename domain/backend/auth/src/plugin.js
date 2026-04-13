import authMiddleware from './auth.middleware.js'
import { getErrorMessage } from './utils/error.js'
import {
    PERMISSIONS,
    loginDtoSchema,
    refreshTokenDtoSchema,
    revokeAllDtoSchema,
    signupRequestDtoSchema,
    tokenDtoSchema,
    userResponseDtoSchema
} from '@ems/domain-shared-auth'
import { withTypeProvider } from '@ems/domain-backend-schema'
import { messageDtoSchema, validationErrorDtoSchema } from '@ems/domain-shared-schema'
import { assert } from '@ems/utils'

/**
 * @import { FastifyInstance } from 'fastify'
 * @import { AuthService } from './auth.service.js'
 * @import { UserService } from './user/index.js'
 */

/**
 * Auth plugin for Fastify
 * @param {FastifyInstance} fastify
 * @param {object} options
 * @param {AuthService} options.authService
 * @param {UserService} options.userService
 */
export default async function authPlugin(fastify, { authService, userService }) {
    const app = withTypeProvider(fastify)

    await app.register(authMiddleware, { authService })

    // Login endpoint (no authentication required)
    app.post('/login', {
        schema: {
            body: loginDtoSchema,
            response: {
                200: tokenDtoSchema,
                401: messageDtoSchema
            }
        },
        handler: async (request, reply) => {
            try {
                const result = await authService.login(request.body)
                return reply.status(200).send(result)
            } catch (error) {
                return reply.status(401).send({ message: getErrorMessage(error) })
            }
        }
    })

    // Signup endpoint (no authentication required)
    app.post('/signup', {
        schema: {
            body: signupRequestDtoSchema,
            response: {
                201: userResponseDtoSchema,
                400: validationErrorDtoSchema,
                409: messageDtoSchema,
                500: messageDtoSchema
            }
        },
        handler: async (request, reply) => {
            try {
                const user = await userService.signup(request.body)

                return reply.status(201).send({ user })
            } catch (error) {
                // Type-safe error handling
                if (error instanceof Error) {
                    // Check for duplicate user error
                    if (error.message.includes('already exists')) {
                        return reply.status(409).send({ message: error.message })
                    }
                }

                // Generic error handling
                return reply.status(500).send({ message: getErrorMessage(error) })
            }
        }
    })

    // Refresh endpoint (no authentication required)
    app.post('/refresh', {
        schema: {
            body: refreshTokenDtoSchema,
            response: {
                200: tokenDtoSchema,
                401: messageDtoSchema
            }
        },
        handler: async (request, reply) => {
            try {
                const result = await authService.refresh(request.body)
                return reply.send(result)
            } catch (error) {
                return reply.status(401).send({ message: getErrorMessage(error) })
            }
        }
    })

    // Logout endpoint (no authentication required)
    app.post('/logout', {
        schema: {
            body: refreshTokenDtoSchema,
            response: {
                200: messageDtoSchema,
                401: messageDtoSchema
            }
        },
        handler: async (request, reply) => {
            try {
                const result = await authService.logout(request.body)
                return reply.send(result)
            } catch (error) {
                return reply.status(401).send({ message: getErrorMessage(error) })
            }
        }
    })

    // Endpoint to revoke all user sessions (REQUIRES auth:revoke-all permission)
    app.post('/revoke-all', {
        preHandler: app.allowOneOf([PERMISSIONS.AUTH_REVOKE_ALL]),
        schema: {
            body: revokeAllDtoSchema,
            response: {
                200: messageDtoSchema,
                401: messageDtoSchema,
                500: messageDtoSchema
            }
        },
        handler: async (request, reply) => {
            try {
                const result = await authService.revokeAll(request.body)
                return reply.send(result)
            } catch (error) {
                return reply.status(500).send({ message: getErrorMessage(error) })
            }
        }
    })

    // Endpoint to get current user information (REQUIRES auth:me permission)
    app.get('/me', {
        preHandler: app.allowOneOf([PERMISSIONS.AUTH_ME]),
        schema: {
            response: {
                200: userResponseDtoSchema,
                401: messageDtoSchema
            }
        },
        handler: async (request, reply) => {
            assert(request.user, 'The request user is required')

            return reply.status(200).send({ user: request.user })
        }
    })
}
