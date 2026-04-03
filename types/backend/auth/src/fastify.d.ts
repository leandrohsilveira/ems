import type { UserDTO } from '@ems/types-shared-auth'

declare module 'fastify' {
    interface FastifyRequest {
        user: UserDTO | null
    }

    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void
        allowOneOf: (
            permissions: string[]
        ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void
    }
}
