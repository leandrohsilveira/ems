/**
 * Session entity from database (with user relation)
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} userId
 * @property {import("@ems/types-shared-auth").User} user
 * @property {string} jti
 * @property {Date} lastRefresh
 * @property {Date} expiresAt
 */
export type Session = {
    id: string
    userId: string
    user: import('@ems/types-shared-auth').User
    jti: string
    lastRefresh: Date
    expiresAt: Date
}
