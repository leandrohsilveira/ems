/** @import { AuthConfig } from '@ems/types-backend-config' */

/**
 * Auth plugin for Fastify
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 * @param {AuthConfig} options.config
 */
// eslint-disable-next-line no-unused-vars
export default async function authPlugin(fastify, { config }) {
    fastify.get('/', (request, reply) => reply.status(200).send({ message: 'Hello' }))
}
