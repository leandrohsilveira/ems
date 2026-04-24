import { randomUUID } from 'crypto'
import logger from 'pino'
import { parseUser } from './user/user.js'
import { createEnum, error, failure, ok, ResultStatus } from '@ems/utils'
import { TokenTypes, TokenServiceFailuresEnum } from './token/token.js'
import { SessionRepositoryFailuresEnum } from './session/index.js'
import { UserRepositoryFailuresEnum } from './user/index.js'

/**
 * @import { AuthConfig } from '@ems/domain-backend-config'
 * @import { LoginDTO, TokenDTO, RefreshTokenDTO, RevokeAllDTO } from '@ems/domain-shared-auth'
 * @import { MessageDTO } from '@ems/domain-shared-schema'
 * @import { ResultOk, ResultFailure, ResultError } from '@ems/utils'
 * @import { TokenService } from './token/token.service.js'
 * @import { UserRepository } from './user/index.js'
 * @import { SessionDTO, SessionRepository } from './session/index.js'
 */

export const AuthServiceFailures = createEnum({
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
    SESSION_EXPIRED: 'SESSION_EXPIRED'
})

/**
 * @exports @typedef AuthService
 * @property {(request: LoginDTO) => Promise<ResultOk<TokenDTO> | ResultFailure<typeof AuthServiceFailures.INVALID_CREDENTIALS> | ResultError>} login
 * @property {(request: RefreshTokenDTO) => Promise<ResultOk<TokenDTO> | ResultFailure<typeof AuthServiceFailures.SESSION_NOT_FOUND | typeof AuthServiceFailures.SESSION_EXPIRED> | ResultError>} refresh
 * @property {(request: RefreshTokenDTO) => Promise<ResultOk<MessageDTO> | ResultFailure<typeof AuthServiceFailures.SESSION_NOT_FOUND> | ResultError>} logout
 * @property {(request: RevokeAllDTO) => Promise<ResultOk<MessageDTO> | ResultError>} revokeAll
 * @property {(token: string) => Promise<ResultOk<SessionDTO> | ResultFailure<typeof AuthServiceFailures.SESSION_NOT_FOUND | typeof AuthServiceFailures.SESSION_EXPIRED> | ResultError>} me
 */

/**
 * @param {UserRepository} userRepository
 * @param {SessionRepository} sessionRepository
 * @param {TokenService} tokenService
 * @param {AuthConfig} config
 * @returns {AuthService}
 */
export function createAuthService(userRepository, sessionRepository, tokenService, config) {
    const log = logger({ name: 'AuthService' })
    return {
        /** @param {LoginDTO} request */
        async login(request) {
            log.info({ username: request.username }, 'Login attempt')

            const {
                status: findStatus,
                data: user,
                error: findErr
            } = await userRepository.findByUsername(request.username)
            switch (findStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(findErr)
                case UserRepositoryFailuresEnum.NOT_FOUND:
                    log.error(
                        { username: request.username },
                        'Login failed: invalid credentials (username)'
                    )
                    return failure(AuthServiceFailures.INVALID_CREDENTIALS)
            }

            const { status: compareStatus, error: compareErr } = await tokenService.comparePassword(
                request.password,
                user.password
            )

            switch (compareStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(compareErr)
                case TokenServiceFailuresEnum.NO_MATCH:
                    log.error(
                        { username: request.username },
                        'Login failed: invalid credentials (password)'
                    )
                    return failure(AuthServiceFailures.INVALID_CREDENTIALS)
            }

            const jti = randomUUID()
            const lastRefresh = new Date()
            const expiresAt = new Date(lastRefresh.getTime() + config.refreshTokenTTL * 1000)

            const {
                status: createStatus,
                data: session,
                error: createErr
            } = await sessionRepository.create({
                userId: user.id,
                jti,
                lastRefresh,
                expiresAt
            })

            switch (createStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(createErr)
                case SessionRepositoryFailuresEnum.CONFLICT:
                    return error('Unexpected session conflict')
            }

            const sessionWithUser = {
                ...session,
                user: parseUser(user)
            }

            const {
                status: accessStatus,
                data: accessToken,
                error: accessErr
            } = tokenService.generateAccessToken(sessionWithUser)

            switch (accessStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(accessErr)
            }

            const {
                status: refreshStatus,
                data: refreshToken,
                error: refreshErr
            } = tokenService.generateRefreshToken(sessionWithUser)

            switch (refreshStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(refreshErr)
            }

            log.info({ username: request.username }, 'Login successful')

            return ok({
                accessToken,
                refreshToken,
                expiresIn: config.accessTokenTTL,
                issuedAt: lastRefresh.toISOString(),
                tokenType: TokenTypes.Bearer
            })
        },

        /** @param {RefreshTokenDTO} request */
        async refresh(request) {
            const {
                status: verifyStatus,
                data: payload,
                error: verifyErr
            } = tokenService.verifyRefreshToken(request.refreshToken)

            switch (verifyStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(verifyErr)
            }

            const {
                status: findStatus,
                data: session,
                error: findErr
            } = await sessionRepository.findByJti(payload.jti)

            switch (findStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(findErr)
                case SessionRepositoryFailuresEnum.NOT_FOUND:
                    return failure(AuthServiceFailures.SESSION_NOT_FOUND)
            }

            if (new Date() > session.expiresAt) return failure(AuthServiceFailures.SESSION_EXPIRED)

            const newJti = randomUUID()
            const lastRefresh = new Date()
            const expiresAt = new Date(lastRefresh.getTime() + config.refreshTokenTTL * 1000)

            const { status: updateStatus, error: updateErr } = await sessionRepository.update(
                session.id,
                {
                    jti: newJti,
                    lastRefresh
                }
            )

            switch (updateStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(updateErr)
                case SessionRepositoryFailuresEnum.CONFLICT:
                    return error('Unexpected session conflict')
            }

            const updatedSession = {
                id: session.id,
                userId: session.userId,
                user: parseUser(session.user),
                jti: newJti,
                lastRefresh,
                expiresAt
            }

            const {
                status: accessStatus,
                data: accessToken,
                error: accessErr
            } = tokenService.generateAccessToken(updatedSession)

            switch (accessStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(accessErr)
            }

            const {
                status: refreshStatus,
                data: refreshToken,
                error: refreshErr
            } = tokenService.generateRefreshToken(updatedSession)

            switch (refreshStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(refreshErr)
            }

            return ok({
                accessToken,
                refreshToken,
                expiresIn: config.accessTokenTTL,
                issuedAt: lastRefresh.toISOString(),
                tokenType: TokenTypes.Bearer
            })
        },

        /** @param {RefreshTokenDTO} request */
        async logout(request) {
            const {
                status: verifyStatus,
                data: payload,
                error: verifyErr
            } = tokenService.verifyRefreshToken(request.refreshToken)

            switch (verifyStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(verifyErr)
            }

            const { status: deleteStatus, error: deleteErr } = await sessionRepository.deleteByJti(
                payload.jti
            )

            switch (deleteStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(deleteErr)
                case SessionRepositoryFailuresEnum.NOT_FOUND:
                    return failure(AuthServiceFailures.SESSION_NOT_FOUND)
            }

            return ok({ message: 'Logged out successfully' })
        },

        /** @param {RevokeAllDTO} userId */
        async revokeAll({ userId }) {
            const { status: deleteStatus, error: deleteErr } =
                await sessionRepository.deleteAllByUserId(userId)

            switch (deleteStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(deleteErr)
            }

            return ok({ message: 'All sessions revoked' })
        },

        /** @param {string} accessToken */
        async me(accessToken) {
            const {
                status: verifyStatus,
                data: payload,
                error: verifyErr
            } = tokenService.verifyAccessToken(accessToken)

            switch (verifyStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(verifyErr)
            }

            const {
                status: findStatus,
                data: session,
                error: findErr
            } = await sessionRepository.findByJti(payload.jti)

            switch (findStatus) {
                case ResultStatus.OK:
                    break
                case ResultStatus.ERROR:
                    return error(findErr)
                case SessionRepositoryFailuresEnum.NOT_FOUND:
                    return failure(AuthServiceFailures.SESSION_NOT_FOUND)
            }

            if (new Date() > session.expiresAt) return failure(AuthServiceFailures.SESSION_EXPIRED)

            return ok({
                ...session,
                user: parseUser(session.user)
            })
        }
    }
}
