/** @import { PrismaClient } from '@ems/database' */
/** @import { UserRepository } from '@ems/types-backend-auth' */

/**
 * Creates a user repository
 * @param {PrismaClient} db
 * @returns {UserRepository}
 */
export function createUserRepository(db) {
    return {
        /**
         * Find user by username
         * @param {string} username
         * @returns {Promise<import('@ems/database').User | null>}
         */
        async findByUsername(username) {
            return db.user.findUnique({ where: { username } })
        },

        /**
         * Find user by ID
         * @param {string} id
         * @returns {Promise<import('@ems/database').User | null>}
         */
        async findById(id) {
            return db.user.findUnique({ where: { id } })
        }
    }
}
