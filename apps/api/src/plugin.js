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
 * @param {object} _options
 */
// eslint-disable-next-line no-unused-vars
export default async function appPlugin(fastify, _options) {
    fastify.get('/', helloWorldOptions, async () => {
        return { message: 'Hello World' }
    })

    await fastify.register(import('@ems/domain-backend-auth'), { prefix: '/auth' })
}
