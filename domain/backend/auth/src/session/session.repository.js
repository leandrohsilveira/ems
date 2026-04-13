/**
 * @import { PrismaClient, Session, SessionWithUser, SessionCreateInput, SessionUpdateInput } from '@ems/database'
 */

/**
 * @exports @typedef SessionRepository
 * @property {(jti: string) => Promise<SessionWithUser | null>} findByJti
 * @property {(userId: string) => Promise<SessionWithUser[]>} findByUserId
 * @property {(data: SessionCreateInput) => Promise<Session>} create
 * @property {(id: string, data: SessionUpdateInput) => Promise<Session>} update
 * @property {(id: string) => Promise<void>} delete
 * @property {(jti: string) => Promise<void>} deleteByJti
 * @property {(userId: string) => Promise<void>} deleteAllByUserId
 */

/**
 * Creates a session repository
 * @param {PrismaClient} db
 * @returns {SessionRepository}
 */
export function createSessionRepository(db) {
    return {
        /**
         * Find session by jti
         * @param {string} jti
         * @returns {Promise<import('@ems/database').SessionWithUser | null>}
         */
        async findByJti(jti) {
            return db.session.findUnique({
                where: { jti },
                include: { user: true }
            })
        },

        /**
         * Find all sessions for a user
         * @param {string} userId
         * @returns {Promise<import('@ems/database').SessionWithUser[]>}
         */
        async findByUserId(userId) {
            return db.session.findMany({
                where: { userId },
                include: { user: true }
            })
        },

        /**
         * Create a new session
         * @param {import('@ems/database').SessionCreateInput} data
         * @returns {Promise<import('@ems/database').Session>}
         */
        async create(data) {
            return db.session.create({ data })
        },

        /**
         * Update a session
         * @param {string} id
         * @param {import('@ems/database').SessionUpdateInput} data
         * @returns {Promise<import('@ems/database').Session>}
         */
        async update(id, data) {
            return db.session.update({
                where: { id },
                data
            })
        },

        /**
         * Delete a session by id
         * @param {string} id
         * @returns {Promise<void>}
         */
        async delete(id) {
            await db.session.delete({ where: { id } })
        },

        /**
         * Delete a session by jti
         * @param {string} jti
         * @returns {Promise<void>}
         */
        async deleteByJti(jti) {
            await db.session.deleteMany({ where: { jti } })
        },

        /**
         * Delete all sessions for a user
         * @param {string} userId
         * @returns {Promise<void>}
         */
        async deleteAllByUserId(userId) {
            await db.session.deleteMany({ where: { userId } })
        }
    }
}
