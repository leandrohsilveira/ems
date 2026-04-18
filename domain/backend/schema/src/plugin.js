import fastifyPlugin from 'fastify-plugin'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import errorHandler from './error-handler.plugin.js'

/**
 * @param {import("fastify").FastifyInstance} fastify
 */
export default fastifyPlugin(
    async function schemaPlugin(fastify) {
        fastify.setValidatorCompiler(validatorCompiler)
        fastify.setSerializerCompiler(serializerCompiler)

        await fastify.register(errorHandler)
    },
    {
        name: 'schema-plugin'
    }
)
