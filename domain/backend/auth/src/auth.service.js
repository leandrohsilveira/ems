import { randomUUID } from 'crypto'
import logger from 'pino'
import { parseUser } from './user/user.js'

/** @import { AuthService } from '@ems/types-backend-auth' */
/** @import { UserRepository } from '@ems/types-backend-auth' */
/** @import { SessionRepository } from '@ems/types-backend-auth' */
/** @import { TokenService } from '@ems/types-backend-auth' */
/** @import { AuthConfig } from '@ems/types-backend-config' */

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
        /** @param {import('@ems/types-shared-auth').LoginRequestDTO} request */
        async login(request) {
            log.info({ username: request.username }, 'Login attempt')
            const user = await userRepository.findByUsername(request.username)
            if (!user) {
                log.error(
                    { username: request.username },
                    'Login failed: invalid credentials (username)'
                )
                throw new Error('Invalid credentials')
            }

            const isValidPassword = await tokenService.comparePassword(
                request.password,
                user.password
            )
            if (!isValidPassword) {
                log.error(
                    { username: request.username },
                    'Login failed: invalid credentials (password)'
                )
                throw new Error('Invalid credentials')
            }

            const jti = randomUUID()
            const lastRefresh = new Date()
            const expiresAt = new Date(lastRefresh.getTime() + config.refreshTokenTTL * 1000)

            const session = await sessionRepository.create({
                userId: user.id,
                jti,
                lastRefresh,
                expiresAt
            })

            const sessionWithUser = {
                ...session,
                user: parseUser(user)
            }

            const accessToken = tokenService.generateAccessToken(sessionWithUser)
            const refreshToken = tokenService.generateRefreshToken(sessionWithUser)

            log.info({ username: request.username }, 'Login successful')
            return {
                accessToken,
                refreshToken,
                expiresIn: config.accessTokenTTL,
                issuedAt: lastRefresh.toISOString(),
                tokenType: 'Bearer'
            }
        },

        /** @param {import('@ems/types-shared-auth').RefreshRequestDTO} request */
        async refresh(request) {
            const payload = tokenService.verifyRefreshToken(request.refreshToken)

            const session = await sessionRepository.findByJti(payload.jti)
            if (!session) {
                throw new Error('Session not found')
            }

            if (new Date() > session.expiresAt) {
                throw new Error('Session expired')
            }

            const newJti = randomUUID()
            const lastRefresh = new Date()
            const expiresAt = new Date(lastRefresh.getTime() + config.refreshTokenTTL * 1000)

            await sessionRepository.update(session.id, {
                jti: newJti,
                lastRefresh
            })

            const updatedSession = {
                id: session.id,
                userId: session.userId,
                user: parseUser(session.user),
                jti: newJti,
                lastRefresh,
                expiresAt
            }

            const accessToken = tokenService.generateAccessToken(updatedSession)
            const refreshToken = tokenService.generateRefreshToken(updatedSession)

            return {
                accessToken,
                refreshToken,
                expiresIn: config.accessTokenTTL,
                issuedAt: lastRefresh.toISOString(),
                tokenType: 'Bearer'
            }
        },

        /** @param {import('@ems/types-shared-auth').LogoutRequestDTO} request */
        async logout(request) {
            const payload = tokenService.verifyRefreshToken(request.refreshToken)
            await sessionRepository.deleteByJti(payload.jti)
            return { message: 'Logged out successfully' }
        },

        /** @param {string} userId */
        async revokeAll(userId) {
            await sessionRepository.deleteAllByUserId(userId)
            return { message: 'All sessions revoked' }
        },

        /** @param {string} accessToken */
        async me(accessToken) {
            const payload = tokenService.verifyAccessToken(accessToken)
            const session = await sessionRepository.findByJti(payload.jti)
            if (!session) {
                throw new Error('Session not found')
            }
            if (new Date() > session.expiresAt) {
                throw new Error('Session expired')
            }
            return {
                ...session,
                user: parseUser(session.user)
            }
        }
    }
}
