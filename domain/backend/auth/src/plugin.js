/** @import { AuthConfig } from '@ems/types-backend-config' */
/** @import { PrismaClient } from '@ems/database' */

/**
 * Auth plugin for Fastify
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 * @param {AuthConfig} options.config
 * @param {PrismaClient} options.db
 */
// eslint-disable-next-line no-unused-vars
export default async function authPlugin(fastify, { config, db }) {
    fastify.get('/', (request, reply) => reply.status(200).send({ message: 'Hello' }))
}
