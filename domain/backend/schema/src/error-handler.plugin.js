import fastifyPlugin from 'fastify-plugin'
import { errorHandling } from './error-handling.js'

export default fastifyPlugin(
    /**
     * Fastify error handling plugin with schema validation support
     * @param {import('fastify').FastifyInstance} fastify
     */
    async function defaultErrorHandling(fastify) {
        // Set global error handler
        fastify.setErrorHandler(errorHandling())

        // Set not found handler
        fastify.setNotFoundHandler(function (request, reply) {
            request.log.warn(
                {
                    reqId: request.id,
                    url: request.url,
                    method: request.method
                },
                'Route not found'
            )

            reply.status(404).send({
                message: 'Route not found'
            })
        })
    },
    {
        name: '@ems/domain-backend-schema/errorHandler'
    }
)
