import authMiddleware from './auth.middleware.js'
import {
    PERMISSIONS,
    loginDtoI18n,
    loginDtoSchema,
    loginErrorsI18n,
    refreshTokenDtoI18n,
    refreshTokenDtoSchema,
    revokeAllDtoI18n,
    revokeAllDtoSchema,
    sessionErrorsI18n,
    signupErrorsI18n,
    signupRequestDtoI18n,
    signupRequestDtoSchema,
    tokenDtoSchema,
    userResponseDtoSchema
} from '@ems/domain-shared-auth'
import { AuthServiceFailures } from './auth.service.js'
import { UserServiceFailures } from './user/index.js'
import { errorHandling, withTypeProvider } from '@ems/domain-backend-schema'
import {
    errorDtoSchema,
    messageDtoSchema,
    resolveErrorLiterals,
    validationErrorDtoSchema
} from '@ems/domain-shared-schema'
import { assert, ResultStatus } from '@ems/utils'

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
                401: errorDtoSchema,
                500: errorDtoSchema
            }
        },
        errorHandler: errorHandling({
            i18n: {
                body: loginDtoI18n
            }
        }),
        handler: async (request, reply) => {
            const literals = resolveErrorLiterals('en_US', loginErrorsI18n)
            const { status, data, error: err } = await authService.login(request.body)

            switch (status) {
                case ResultStatus.OK:
                    return reply.status(200).send(data)
                case AuthServiceFailures.INVALID_CREDENTIALS:
                    return reply.status(401).send({
                        code: 'HTTP',
                        message: literals.incorrectUsernameOrPassword
                    })
                case ResultStatus.ERROR:
                    request.log.error(err)
                    return reply
                        .status(500)
                        .send({ code: 'UNEXPECTED', message: literals.somethingWentWrongError })
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
                409: errorDtoSchema,
                500: errorDtoSchema
            }
        },
        errorHandler: errorHandling({
            i18n: {
                body: signupRequestDtoI18n
            }
        }),
        handler: async (request, reply) => {
            const literals = resolveErrorLiterals('en_US', signupErrorsI18n)

            const { status, data, error: err } = await userService.signup(request.body)

            switch (status) {
                case ResultStatus.OK:
                    return reply.status(201).send({ user: data })
                case UserServiceFailures.CONFLICT:
                    return reply.status(409).send({
                        code: 'HTTP',
                        message: literals.usernameOrEmailAlreadyExists
                    })
                case ResultStatus.ERROR:
                    request.log.error(err)
                    return reply
                        .status(500)
                        .send({ code: 'UNEXPECTED', message: literals.somethingWentWrongError })
            }
        }
    })

    // Refresh endpoint (no authentication required)
    app.post('/refresh', {
        schema: {
            body: refreshTokenDtoSchema,
            response: {
                200: tokenDtoSchema,
                401: errorDtoSchema,
                500: errorDtoSchema
            }
        },
        errorHandler: errorHandling({
            i18n: {
                body: refreshTokenDtoI18n
            }
        }),
        handler: async (request, reply) => {
            const authLiterals = resolveErrorLiterals('en_US', sessionErrorsI18n)

            const { status, data, error: err } = await authService.refresh(request.body)

            switch (status) {
                case ResultStatus.OK:
                    return reply.send(data)
                case AuthServiceFailures.SESSION_NOT_FOUND:
                    return reply.status(401).send({
                        code: 'HTTP',
                        message: authLiterals.sessionNotFound
                    })
                case AuthServiceFailures.SESSION_EXPIRED:
                    return reply.status(401).send({
                        code: 'HTTP',
                        message: authLiterals.sessionExpired
                    })
                case ResultStatus.ERROR:
                    request.log.error(err)
                    return reply
                        .status(500)
                        .send({ code: 'UNEXPECTED', message: authLiterals.somethingWentWrongError })
            }
        }
    })

    // Logout endpoint (no authentication required)
    app.post('/logout', {
        schema: {
            body: refreshTokenDtoSchema,
            response: {
                200: messageDtoSchema,
                401: errorDtoSchema,
                500: errorDtoSchema
            }
        },
        errorHandler: errorHandling({
            i18n: {
                body: refreshTokenDtoI18n
            }
        }),
        handler: async (request, reply) => {
            const authLiterals = resolveErrorLiterals('en_US', sessionErrorsI18n)
            const { status, data, error: err } = await authService.logout(request.body)

            switch (status) {
                case ResultStatus.OK:
                    return reply.send(data)
                case AuthServiceFailures.SESSION_NOT_FOUND:
                    return reply.status(401).send({
                        code: 'HTTP',
                        message: authLiterals.sessionNotFound
                    })
                case ResultStatus.ERROR:
                    request.log.error(err)
                    return reply
                        .status(500)
                        .send({ code: 'UNEXPECTED', message: authLiterals.somethingWentWrongError })
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
                500: errorDtoSchema
            }
        },
        errorHandler: errorHandling({
            i18n: {
                body: revokeAllDtoI18n
            }
        }),
        handler: async (request, reply) => {
            const authLiterals = resolveErrorLiterals('en_US', sessionErrorsI18n)
            const { status, data, error: err } = await authService.revokeAll(request.body)

            switch (status) {
                case ResultStatus.OK:
                    return reply.send(data)
                case ResultStatus.ERROR:
                    request.log.error(err)
                    return reply
                        .status(500)
                        .send({ code: 'UNEXPECTED', message: authLiterals.somethingWentWrongError })
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
