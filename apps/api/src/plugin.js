/** @type {import('fastify').RouteShorthandOptions} */
const helloWorldOptions = {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                }
            }
        }
    }
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 */
export default async function appPlugin(fastify, options) {
    fastify.get('/', helloWorldOptions, async () => {
        return { message: 'Hello World' }
    })

    await fastify.register(import('@ems/domain-backend-auth'), { prefix: '/auth' })
}
