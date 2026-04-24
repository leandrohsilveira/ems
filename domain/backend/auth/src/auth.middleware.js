import fastifyPlugin from 'fastify-plugin'
import { roleHasPermission } from '@ems/domain-shared-auth'
import { ResultStatus } from '@ems/utils'
import { AuthServiceFailures } from './auth.service.js'

/** @import { FastifyInstance } from 'fastify' */
/** @import { AuthService } from './auth.service.js' */

export default fastifyPlugin(
    /**
     * @param {FastifyInstance} fastify
     * @param {{ authService: AuthService }} opts
     */
    async function authMiddleware(fastify, { authService }) {
        // Decorates request with user null by default
        fastify.decorateRequest('user', null)

        // Creates authenticate decorator that validates the token
        fastify.decorate('authenticate', async function (request, reply) {
            const authHeader = request.headers.authorization

            if (!authHeader) {
                return reply.status(401).send({ message: 'Authorization header required' })
            }

            if (!authHeader.startsWith('Bearer ')) {
                return reply.status(401).send({ message: 'Invalid authorization format' })
            }

            const accessToken = authHeader.slice(7).trim()
            if (!accessToken) {
                return reply.status(401).send({ message: 'Token missing' })
            }

            const { status, data, error: err } = await authService.me(accessToken)

            switch (status) {
                case ResultStatus.OK:
                    request.user = data.user
                    break
                case AuthServiceFailures.SESSION_EXPIRED:
                case AuthServiceFailures.SESSION_NOT_FOUND:
                case ResultStatus.ERROR:
                    request.log.error(err || status)
                    return reply.status(401).send({ message: 'Invalid or expired token' })
            }
        })

        // Creates allowOneOf decorator that validates if user has at least one of the permissions
        fastify.decorate('allowOneOf', function (permissions) {
            return async function (request, reply) {
                // First authenticate the user
                await fastify.authenticate(request, reply)

                // If authentication failed, return early (authenticate already sent response)
                if (reply.sent) {
                    return
                }

                // Check if user is authenticated
                if (!request.user) {
                    return reply.status(401).send({ message: 'User not authenticated' })
                }

                // Store user in variable after null check
                const user = request.user

                // Check if user has at least one of the required permissions
                const hasPermission = permissions.some((permission) =>
                    roleHasPermission(user.role, permission)
                )

                if (!hasPermission) {
                    return reply.status(403).send({ message: 'Insufficient permissions' })
                }
            }
        })
    }
)
