import { formatError, resolveValidationLiterals } from '@ems/domain-shared-schema'

/**
 * @import { FastifyError, FastifyRequest, FastifyReply } from "fastify"
 * @import { I18n } from "@ems/i18n"
 */

/** @typedef {'body' | 'headers' | 'params' | 'querystring'} ValidationContext */
/** @typedef {Partial<Record<ValidationContext, I18n<*, *, *>>>} I18nMapper  */

/**
 * @param {object} [options={}]
 * @param {I18nMapper} [options.i18n={}]
 */
export function errorHandling({ i18n = {} } = {}) {
    return handle

    /**
     * @param {FastifyError} error
     * @param {FastifyRequest} request
     * @param {FastifyReply} reply
     */
    async function handle(error, request, reply) {
        const statusCode = error.statusCode || 500

        // Handle Fastify schema validation errors
        if (error.validation && error.validationContext) {
            const literals = resolveValidationLiterals('en_US', i18n[error.validationContext])

            const validationError = formatError(
                {
                    issues: (error.validation ?? []).map((issue) => ({
                        code: issue.keyword,
                        message: issue.message ?? 'Validation failed',
                        path: issue.instancePath
                            .replace(/^\//, '')
                            .split('/')
                            .map((segment) =>
                                Number.isNaN(Number(segment)) ? segment : Number(segment)
                            ),
                        ...issue.params
                    }))
                },
                literals
            )

            return reply.status(400).send(validationError)
        }

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

        // Handle other errors with existing format
        const response = {
            message: error.message || 'Internal server error'
        }

        return reply.status(statusCode).send(response)
    }
}
