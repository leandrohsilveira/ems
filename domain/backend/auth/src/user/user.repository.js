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
        },

        /**
         * Create a new user
         * @param {import('@ems/database').UserCreateInput} data
         * @returns {Promise<import('@ems/database').User>}
         */
        async create(data) {
            return db.user.create({ data })
        },

        /**
         * Find user by email
         * @param {string} email
         * @returns {Promise<import('@ems/database').User | null>}
         */
        async findByEmail(email) {
            return db.user.findUnique({ where: { email } })
        },

        /**
         * Find user by username or email
         * @param {string} username
         * @param {string} email
         * @returns {Promise<import('@ems/database').User | null>}
         */
        async findByUsernameOrEmail(username, email) {
            return db.user.findFirst({
                where: {
                    OR: [{ username }, { email }]
                }
            })
        }
    }
}
