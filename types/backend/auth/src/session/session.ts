import type { UserDTO } from '@ems/types-shared-auth'

export type SessionDTO = {
    id: string
    userId: string
    jti: string
    lastRefresh: Date
    expiresAt: Date
    user: UserDTO
}
