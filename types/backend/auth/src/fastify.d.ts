import type { UserDTO } from '@ems/types-shared-auth'

declare module 'fastify' {
    interface FastifyRequest {
        user: UserDTO | null
    }
}
