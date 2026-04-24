import { DatabaseRequestFailures, handleDatabaseError } from '@ems/database'
import { createEnum, error, failure, ok, tryCatchAsync } from '@ems/utils'

/**
 * @import { PrismaClient, Session, SessionWithUser, SessionCreateInput, SessionUpdateInput } from '@ems/database'
 * @import { ResultOk, ResultFailure, ResultError } from "@ems/utils"
 */

export const SessionRepositoryFailuresEnum = createEnum({
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT'
})

/**
 * @typedef {typeof SessionRepositoryFailuresEnum} SessionRepositoryFailures
 */

/**
 * @exports @typedef SessionRepository
 * @property {(jti: string) => Promise<ResultOk<SessionWithUser> | ResultFailure<SessionRepositoryFailures['NOT_FOUND']> | ResultError>} findByJti
 * @property {(userId: string) => Promise<ResultOk<SessionWithUser[]> | ResultError>} findByUserId
 * @property {(data: SessionCreateInput) => Promise<ResultOk<Session> | ResultFailure<SessionRepositoryFailures['CONFLICT']> | ResultError>} create
 * @property {(id: string, data: SessionUpdateInput) => Promise<ResultOk<Session> | ResultFailure<SessionRepositoryFailures['CONFLICT']> | ResultError>} update
 * @property {(id: string) => Promise<ResultOk<null> | ResultFailure<SessionRepositoryFailures['NOT_FOUND']> | ResultError>} delete
 * @property {(jti: string) => Promise<ResultOk<null> | ResultFailure<SessionRepositoryFailures['NOT_FOUND']> | ResultError>} deleteByJti
 * @property {(userId: string) => Promise<ResultOk<null> | ResultError>} deleteAllByUserId
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
         */
        findByJti(jti) {
            return tryCatchAsync(
                async () => {
                    const session = await db.session.findUnique({
                        where: { jti },
                        include: { user: true }
                    })
                    if (!session) {
                        return failure(SessionRepositoryFailuresEnum.NOT_FOUND)
                    }
                    return ok(session)
                },
                async (err) => {
                    return error(err)
                }
            )
        },

        /**
         * Find all sessions for a user
         * @param {string} userId
         */
        findByUserId(userId) {
            return tryCatchAsync(
                async () => {
                    const sessions = await db.session.findMany({
                        where: { userId },
                        include: { user: true }
                    })
                    return ok(sessions)
                },
                async (err) => {
                    return error(err)
                }
            )
        },

        /**
         * Create a new session
         * @param {import('@ems/database').SessionCreateInput} data
         */
        create(data) {
            return tryCatchAsync(
                async () => {
                    const session = await db.session.create({ data })
                    return ok(session)
                },
                async (err) => {
                    return handleDatabaseError(err, (code) => {
                        if (code === DatabaseRequestFailures.UNIQUE_CONSTRAINT_FAILED)
                            return failure(SessionRepositoryFailuresEnum.CONFLICT)
                    })
                }
            )
        },

        /**
         * Update a session
         * @param {string} id
         * @param {import('@ems/database').SessionUpdateInput} data
         */
        update(id, data) {
            return tryCatchAsync(
                async () => {
                    const session = await db.session.update({
                        where: { id },
                        data
                    })
                    return ok(session)
                },
                async (err) => {
                    return handleDatabaseError(err, (code) => {
                        if (code === DatabaseRequestFailures.UNIQUE_CONSTRAINT_FAILED)
                            return failure(SessionRepositoryFailuresEnum.CONFLICT)
                    })
                }
            )
        },

        /**
         * Delete a session by id
         * @param {string} id
         */
        delete(id) {
            return tryCatchAsync(
                async () => {
                    await db.session.delete({ where: { id } })
                    return ok(null)
                },
                async (err) => {
                    return handleDatabaseError(err, (code) => {
                        if (code === DatabaseRequestFailures.REQUIRED_RECORDS_NOT_FOUND)
                            return failure(SessionRepositoryFailuresEnum.NOT_FOUND)
                    })
                }
            )
        },

        /**
         * Delete a session by jti
         * @param {string} jti
         */
        deleteByJti(jti) {
            return tryCatchAsync(
                async () => {
                    await db.session.delete({ where: { jti } })
                    return ok(null)
                },
                async (err) => {
                    return handleDatabaseError(err, (code) => {
                        if (code === DatabaseRequestFailures.REQUIRED_RECORDS_NOT_FOUND)
                            return failure(SessionRepositoryFailuresEnum.NOT_FOUND)
                    })
                }
            )
        },

        /**
         * Delete all sessions for a user
         * @param {string} userId
         */
        deleteAllByUserId(userId) {
            return tryCatchAsync(
                async () => {
                    await db.session.deleteMany({ where: { userId } })
                    return ok(null)
                },
                async (err) => {
                    return error(err)
                }
            )
        }
    }
}
