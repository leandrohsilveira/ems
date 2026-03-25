import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { userStore } from './user.store.js'
import { tokenStore } from './token.store.js'
/** @import { AuthConfig, User } from '@ems/types-backend-auth' */

/**
 * Auth service for token management
 */
export const authService = {
    /**
     * Login user with credentials
     * @param {string} username
     * @param {string} password
     * @param {AuthConfig} config
     * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number, tokenType: string}>}
     */
    async login(username, password, config) {
        const user = userStore.findByUsername(username)
        if (!user) {
            throw new Error('Invalid credentials')
        }

        const isValid = await userStore.validatePassword(user, password)
        if (!isValid) {
            throw new Error('Invalid credentials')
        }

        const accessToken = this.generateAccessToken(user, config)
        const refreshToken = await this.generateRefreshToken(user, config)

        return {
            accessToken,
            refreshToken,
            expiresIn: config.accessTokenTtl || 900,
            tokenType: 'Bearer'
        }
    },

    /**
     * Generate access token
     * @param {User} user
     * @param {AuthConfig} config
     * @returns {string}
     */
    generateAccessToken(user, config) {
        const payload = {
            sub: user.id,
            username: user.username,
            roles: user.roles,
            type: 'access'
        }
        return jwt.sign(payload, config.jwtSecret, {
            expiresIn: config.accessTokenTtl || 900
        })
    },

    /**
     * Generate refresh token with rotation
     * @param {User} user
     * @param {AuthConfig} config
     * @returns {Promise<string>}
     */
    async generateRefreshToken(user, config) {
        const jti = crypto.randomUUID()
        const token = jwt.sign({ sub: user.id, jti, type: 'refresh' }, config.jwtSecret, {
            expiresIn: config.refreshTokenTtl || 604800
        })

        const expiresAt = new Date(Date.now() + (config.refreshTokenTtl || 604800) * 1000)

        tokenStore.store(
            {
                jti,
                userId: user.id,
                expiresAt,
                createdAt: new Date()
            },
            token
        )

        return token
    },

    /**
     * Refresh access token
     * @param {string} refreshToken
     * @param {AuthConfig} config
     * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number, tokenType: string}>}
     */
    async refresh(refreshToken, config) {
        /** @type {import('jsonwebtoken').JwtPayload} */
        let decoded
        try {
            decoded = /** @type {import('jsonwebtoken').JwtPayload} */ (
                jwt.verify(refreshToken, config.jwtSecret)
            )
        } catch {
            throw new Error('Invalid refresh token')
        }

        if (decoded.type !== 'refresh') {
            throw new Error('Invalid refresh token')
        }

        if (!decoded.jti || !tokenStore.verifyToken(decoded.jti, refreshToken)) {
            throw new Error('Invalid refresh token')
        }

        const userId = decoded.sub
        if (!userId) {
            throw new Error('Invalid refresh token')
        }

        const user = userStore.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }

        tokenStore.removeByJti(decoded.jti)

        const accessToken = this.generateAccessToken(user, config)
        const newRefreshToken = await this.generateRefreshToken(user, config)

        return {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: config.accessTokenTtl || 900,
            tokenType: 'Bearer'
        }
    },

    /**
     * Logout - revoke refresh token
     * @param {string} refreshToken
     * @param {AuthConfig} config
     * @returns {Promise<void>}
     */
    async logout(refreshToken, config) {
        try {
            const decoded = /** @type {import('jsonwebtoken').JwtPayload} */ (
                jwt.verify(refreshToken, config.jwtSecret)
            )
            if (decoded.type === 'refresh' && decoded.jti) {
                tokenStore.removeByJti(decoded.jti)
            }
        } catch {
            // Token invalid, ignore
        }
    },

    /**
     * Revoke all tokens for a user
     * @param {string} userId
     * @returns {Promise<void>}
     */
    async revokeAll(userId) {
        tokenStore.removeAllForUser(userId)
    },

    /**
     * Verify access token and return user info
     * @param {string} accessToken
     * @param {AuthConfig} config
     * @returns {Promise<{userId: string, username: string, roles: string[]}>}
     */
    async verifyAccessToken(accessToken, config) {
        /** @type {import('jsonwebtoken').JwtPayload} */
        let decoded
        try {
            decoded = /** @type {import('jsonwebtoken').JwtPayload} */ (
                jwt.verify(accessToken, config.jwtSecret)
            )
        } catch (err) {
            if (err instanceof Error && err.name === 'TokenExpiredError') {
                throw new Error('Token expired')
            }
            throw new Error('Invalid access token')
        }

        if (decoded.type !== 'access') {
            throw new Error('Invalid access token')
        }

        return {
            userId: decoded.sub || '',
            username: decoded.username || '',
            roles: decoded.roles || []
        }
    }
}
