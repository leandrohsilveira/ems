/** @import { PrismaClient } from '@ems/database' */
/** @import { SessionRepository } from '@ems/types-backend-auth' */

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
         * @param {boolean} [includeUser]
         * @returns {Promise<import('@ems/database').Session | null>}
         */
        async findByJti(jti, includeUser = false) {
            return db.session.findUnique({
                where: { jti },
                include: includeUser ? { user: true } : undefined
            })
        },

        /**
         * Find all sessions for a user
         * @param {string} userId
         * @param {boolean} [includeUser]
         * @returns {Promise<import('@ems/database').Session[]>}
         */
        async findByUserId(userId, includeUser = false) {
            return db.session.findMany({
                where: { userId },
                include: includeUser ? { user: true } : undefined
            })
        },

        /**
         * Create a new session
         * @param {import('@ems/types-backend-auth').SessionCreateInput} data
         * @returns {Promise<import('@ems/database').Session>}
         */
        async create(data) {
            return db.session.create({ data })
        },

        /**
         * Update a session
         * @param {string} id
         * @param {import('@ems/types-backend-auth').SessionUpdateInput} data
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
