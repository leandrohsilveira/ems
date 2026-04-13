import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { assert } from '@ems/utils'

/**
 * @import { AuthConfig } from '@ems/domain-backend-config'
 * @import { JwtPayload } from 'jsonwebtoken'
 * @import { SessionDTO } from "../session/index.js"
 * @import { AccessTokenPayloadDTO, RefreshTokenPayloadDTO } from "./token.js",
 */

/**
 * @exports @typedef TokenService
 * @property {(session: SessionDTO) => string} generateAccessToken
 * @property {(session: SessionDTO) => string} generateRefreshToken
 * @property {(token: string) => AccessTokenPayloadDTO} verifyAccessToken
 * @property {(token: string) => RefreshTokenPayloadDTO} verifyRefreshToken
 * @property {(password: string) => Promise<string>} hashPassword
 * @property {(password: string, hash: string) => Promise<boolean>} comparePassword
 */

/**
 * @overload
 * @param {JwtPayload | string | undefined} payload
 * @param {'access'} type
 * @returns {AccessTokenPayloadDTO}
 */
/**
 * @overload
 * @param {JwtPayload | string | undefined} payload
 * @param {'refresh'} type
 * @returns {RefreshTokenPayloadDTO}
 */
/**
 * @param {JwtPayload | string | undefined} payload
 * @param {'access' | 'refresh'} type
 * @returns {AccessTokenPayloadDTO | RefreshTokenPayloadDTO}
 */
function parseTokenPayload(payload, type) {
    if (typeof payload === 'string' || !payload) {
        throw new Error(`Unable to parse ${type} token payload`)
    }

    if (type === 'access') {
        assert(
            typeof payload.type === 'string' && payload.type === 'access',
            'Invalid access token type'
        )
        const { sub, username, role, jti, iat, exp, type: tokenType } = payload
        assert(typeof sub === 'string', 'Missing access token sub')
        assert(typeof username === 'string', 'Missing access token username')
        assert(typeof role === 'string', 'Missing access token role')
        assert(typeof jti === 'string', 'Missing access token jti')
        assert(typeof iat === 'number', 'Missing access token iat')
        assert(typeof exp === 'number', 'Missing access token exp')
        return { sub, username, role, jti, iat, exp, type: tokenType }
    }

    assert(
        typeof payload.type === 'string' && payload.type === 'refresh',
        'Invalid refresh token type'
    )
    const { sub, jti, sessionId, iat, exp, type: tokenType } = payload
    assert(typeof sub === 'string', 'Missing refresh token sub')
    assert(typeof jti === 'string', 'Missing refresh token jti')
    assert(typeof sessionId === 'string', 'Missing refresh token sessionId')
    assert(typeof iat === 'number', 'Missing refresh token iat')
    assert(typeof exp === 'number', 'Missing refresh token exp')
    return { sub, jti, sessionId, iat, exp, type: tokenType }
}

/**
 * Creates a token service
 * @param {AuthConfig} config
 * @returns {TokenService}
 */
export function createTokenService(config) {
    return {
        /** @param {SessionDTO} session */
        generateAccessToken(session) {
            const payload = {
                sub: session.userId,
                username: session.user.username,
                role: session.user.role,
                jti: session.jti,
                type: 'access'
            }
            return jwt.sign(payload, config.jwtSecret, {
                expiresIn: config.accessTokenTTL
            })
        },

        /** @param {SessionDTO} session */
        generateRefreshToken(session) {
            const payload = {
                sub: session.userId,
                jti: session.jti,
                sessionId: session.id,
                type: 'refresh'
            }
            return jwt.sign(payload, config.jwtSecret, {
                expiresIn: config.refreshTokenTTL
            })
        },

        /** @param {string} token */
        verifyAccessToken(token) {
            const payload = jwt.verify(token, config.jwtSecret)
            return parseTokenPayload(payload, 'access')
        },

        /** @param {string} token */
        verifyRefreshToken(token) {
            const payload = jwt.verify(token, config.jwtSecret)
            return parseTokenPayload(payload, 'refresh')
        },

        /** @param {string} password */
        async hashPassword(password) {
            return bcrypt.hash(password, 10)
        },

        /** @param {string} password */
        /** @param {string} hash */
        async comparePassword(password, hash) {
            return bcrypt.compare(password, hash)
        }
    }
}
