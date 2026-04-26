import { roleHasPermission } from '@ems/domain-shared-auth'

/**
 * @import { FastifyInstance } from 'fastify'
 */

/**
 * Registers a mock auth middleware that sets up authenticate and allowOneOf decorators
 * with actual permission checking via roleHasPermission.
 * @param {FastifyInstance} fastify
 */
export async function registerMockAuth(fastify) {
    fastify.decorateRequest('user', null)
    fastify.decorate('authenticate', async function (request, reply) {
        const authHeader = request.headers.authorization
        if (!authHeader) {
            return reply.status(401).send({ message: 'Authorization header required' })
        }
        request.user = {
            userId: 'user-1',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            role: 'USER'
        }
    })
    fastify.decorate('allowOneOf', function (permissions) {
        return async function (request, reply) {
            await fastify.authenticate(request, reply)
            if (reply.sent) return
            const user = request.user
            if (!user) {
                return reply.status(401).send({ message: 'User not authenticated' })
            }
            const hasPermission = permissions.some((permission) =>
                roleHasPermission(user.role, permission)
            )
            if (!hasPermission) {
                return reply.status(403).send({ message: 'Insufficient permissions' })
            }
        }
    })
}
