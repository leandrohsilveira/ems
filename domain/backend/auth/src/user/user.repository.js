import { DatabaseRequestFailures, handleDatabaseError } from '@ems/database'
import { createEnum, failure, ok, tryCatchAsync } from '@ems/utils'

/**
 * @import { PrismaClient, User, UserCreateInput } from '@ems/database'
 * @import { ResultOk, ResultFailure, ResultError } from '@ems/utils'
 */

export const UserRepositoryFailuresEnum = createEnum({
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT'
})

/**
 * @typedef {typeof UserRepositoryFailuresEnum} UserRepositoryFailures
 */

/**
 * @exports @typedef UserRepository
 * @property {(username: string) => Promise<ResultOk<User> | ResultFailure<UserRepositoryFailures['NOT_FOUND']> | ResultError>} findByUsername
 * @property {(id: string) => Promise<ResultOk<User> | ResultFailure<UserRepositoryFailures['NOT_FOUND']> | ResultError>} findById
 * @property {(email: string) => Promise<ResultOk<User> | ResultFailure<UserRepositoryFailures['NOT_FOUND']> | ResultError>} findByEmail
 * @property {(username: string, email: string) => Promise<ResultOk<User> | ResultFailure<UserRepositoryFailures['NOT_FOUND']> | ResultError>} findByUsernameOrEmail
 * @property {(input: UserCreateInput) => Promise<ResultOk<User> | ResultFailure<UserRepositoryFailures['CONFLICT']> | ResultError>} create
 */

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
         */
        findByUsername(username) {
            return tryCatchAsync(async () => {
                const user = await db.user.findUnique({ where: { username } })
                if (!user) {
                    return failure(UserRepositoryFailuresEnum.NOT_FOUND)
                }
                return ok(user)
            })
        },

        /**
         * Find user by ID
         * @param {string} id
         */
        findById(id) {
            return tryCatchAsync(async () => {
                const user = await db.user.findUnique({ where: { id } })
                if (!user) {
                    return failure(UserRepositoryFailuresEnum.NOT_FOUND)
                }
                return ok(user)
            })
        },

        /**
         * Find user by email
         * @param {string} email
         */
        findByEmail(email) {
            return tryCatchAsync(async () => {
                const user = await db.user.findUnique({ where: { email } })
                if (!user) {
                    return failure(UserRepositoryFailuresEnum.NOT_FOUND)
                }
                return ok(user)
            })
        },

        /**
         * Find user by username or email
         * @param {string} username
         * @param {string} email
         */
        findByUsernameOrEmail(username, email) {
            return tryCatchAsync(async () => {
                const user = await db.user.findFirst({
                    where: {
                        OR: [{ username }, { email }]
                    }
                })
                if (!user) {
                    return failure(UserRepositoryFailuresEnum.NOT_FOUND)
                }
                return ok(user)
            })
        },

        /**
         * Create a new user
         * @param {import('@ems/database').UserCreateInput} data
         */
        create(data) {
            return tryCatchAsync(
                async () => {
                    const user = await db.user.create({ data })
                    return ok(user)
                },
                async (err) => {
                    return handleDatabaseError(err, (code) => {
                        if (code === DatabaseRequestFailures.UNIQUE_CONSTRAINT_FAILED)
                            return failure(UserRepositoryFailuresEnum.CONFLICT)
                    })
                }
            )
        }
    }
}
