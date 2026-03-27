import type { User } from '@ems/types-shared-auth'

/**
 * Session entity from database (with user relation)
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} userId
 * @property {User} user
 * @property {string} jti
 * @property {Date} lastRefresh
 * @property {Date} expiresAt
 */
export type Session = {
    id: string
    userId: string
    user: User
    jti: string
    lastRefresh: Date
    expiresAt: Date
}
