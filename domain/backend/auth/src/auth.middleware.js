import fastifyPlugin from 'fastify-plugin'
import '@ems/types-backend-auth'

/** @import { FastifyInstance } from 'fastify' */
/** @import { AuthService } from '@ems/types-backend-auth' */

export default fastifyPlugin(
    /**
     * @param {FastifyInstance} fastify
     * @param {{ authService: AuthService }} opts
     */
    async function authMiddleware(fastify, { authService }) {
        fastify.decorateRequest('user', null)
        fastify.addHook('preHandler', async (request, reply) => {
            const authHeader = request.headers.authorization

            if (!authHeader) {
                request.user = null
                return
            }

            if (!authHeader.startsWith('Bearer ')) {
                request.user = null
                return
            }

            const accessToken = authHeader.slice(7).trim()
            if (!accessToken) {
                request.user = null
                return
            }

            try {
                const session = await authService.me(accessToken)
                request.user = session.user
            } catch {
                return reply.status(401).send({ error: 'Invalid or expired token' })
            }
        })
    }
)
