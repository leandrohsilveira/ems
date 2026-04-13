import fastifyPlugin from 'fastify-plugin'

export default fastifyPlugin(
    /**
     * Fastify error handling plugin with schema validation support
     * @param {import('fastify').FastifyInstance} fastify
     */
    async function errorHandling(fastify) {
        // Set global error handler
        fastify.setErrorHandler(
            /**
             * @param {import('fastify').FastifyError} error
             */
            async (error, request, reply) => {
                const statusCode = error.statusCode || 500

                // Differentiate logging based on error type
                if (statusCode >= 500) {
                    // Server errors (5xx) - log as error
                    request.log.error(
                        {
                            err: error,
                            reqId: request.id,
                            url: request.url,
                            method: request.method,
                            validationContext: error.validationContext
                        },
                        'Server error'
                    )
                } else {
                    // Client errors (4xx) - log as warn
                    request.log.warn(
                        {
                            err: error,
                            reqId: request.id,
                            url: request.url,
                            method: request.method,
                            validationContext: error.validationContext
                        },
                        'Client error'
                    )
                }

                // Handle Fastify schema validation errors
                if (error.validation) {
                    // Maintain existing ValidationErrorDTO format
                    /** @type {import('@ems/domain-shared-schema').ValidationErrorDTO} */
                    const validationError = {
                        fields: {}
                    }

                    // Transform Fastify validation errors to existing format
                    for (const validationErrorItem of error.validation ?? []) {
                        let field
                        if (validationErrorItem.keyword === 'required') {
                            field = String(validationErrorItem.params.missingProperty || 'unknown')
                        } else {
                            field =
                                validationErrorItem.instancePath
                                    ?.replace(/^\//, '')
                                    .replace(/\//g, '.') || 'unknown'
                        }
                        validationError.fields[field] ??= []
                        validationError.fields[field].push(
                            validationErrorItem.message || 'Validation failed'
                        )
                    }

                    return reply.status(400).send(validationError)
                }

                // Handle other errors with existing format
                const response = {
                    message: error.message || 'Internal server error'
                }

                return reply.status(statusCode).send(response)
            }
        )

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
