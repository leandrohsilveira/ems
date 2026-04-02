import fastifyPlugin from 'fastify-plugin'
import { getErrorMessage } from './utils/error.js'

/** @import { FastifyInstance } from 'fastify' */
/** @import { AuthService } from '@ems/types-backend-auth' */

export default fastifyPlugin(
    /**
     * @param {FastifyInstance} fastify
     * @param {{ authService: AuthService }} opts
     */
    async function authMiddleware(fastify, { authService }) {
        // Apenas decora o request com user null por padrão
        fastify.decorateRequest('user', null)

        // Cria o decorator authenticate que valida o token
        fastify.decorate('authenticate', async function (request, reply) {
            const authHeader = request.headers.authorization

            if (!authHeader) {
                return reply.status(401).send({ error: 'Authorization header required' })
            }

            if (!authHeader.startsWith('Bearer ')) {
                return reply.status(401).send({ error: 'Invalid authorization format' })
            }

            const accessToken = authHeader.slice(7).trim()
            if (!accessToken) {
                return reply.status(401).send({ error: 'Token missing' })
            }

            try {
                const session = await authService.me(accessToken)
                request.user = session.user
            } catch (error) {
                return reply
                    .status(401)
                    .send({ error: 'Invalid or expired token', message: getErrorMessage(error) })
            }
        })
    }
)
