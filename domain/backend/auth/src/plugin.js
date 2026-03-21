/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function authPlugin(fastify) {
    fastify.get('/hello', async () => ({ message: 'Hello from auth' }))
}
