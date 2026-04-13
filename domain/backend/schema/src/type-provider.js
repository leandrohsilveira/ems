/**
 * @import { FastifyInstance } from "fastify"
 * @import { ZodTypeProvider } from "fastify-type-provider-zod"
 */

/**
 * @param {FastifyInstance} fastify
 */
export function withTypeProvider(fastify) {
    return /** @type {typeof fastify.withTypeProvider<ZodTypeProvider>} */ (
        fastify.withTypeProvider
    )()
}
