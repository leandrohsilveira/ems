import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { assert, createEnum, failure, ok, tryCatch, tryCatchAsync } from '@ems/utils'

/**
 * @import { ResultOk, ResultError, ResultFailure } from '@ems/utils'
 * @import { AuthConfig } from '@ems/domain-backend-config'
 * @import { JwtPayload } from 'jsonwebtoken'
 * @import { SessionDTO } from "../session/index.js"
 * @import { AccessTokenPayloadDTO, RefreshTokenPayloadDTO } from "./token.js",
 */

export const TokenServiceFailuresEnum = createEnum({
    NO_MATCH: 'NO_MATCH'
})

/**
 * @exports @typedef TokenService
 * @property {(session: SessionDTO) => (ResultOk<string> | ResultError)} generateAccessToken
 * @property {(session: SessionDTO) => (ResultOk<string> | ResultError)} generateRefreshToken
 * @property {(token: string) => (ResultOk<AccessTokenPayloadDTO> | ResultError)} verifyAccessToken
 * @property {(token: string) => (ResultOk<RefreshTokenPayloadDTO> | ResultError)} verifyRefreshToken
 * @property {(password: string) => Promise<ResultOk<string> | ResultError>} hashPassword
 * @property {(password: string, hash: string) => Promise<ResultOk<boolean> | ResultFailure<typeof TokenServiceFailuresEnum.NO_MATCH> | ResultError>} comparePassword
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
            return tryCatch(() =>
                ok(
                    jwt.sign(
                        {
                            sub: session.userId,
                            username: session.user.username,
                            role: session.user.role,
                            jti: session.jti,
                            type: 'access'
                        },
                        config.jwtSecret,
                        {
                            expiresIn: config.accessTokenTTL
                        }
                    )
                )
            )
        },

        /** @param {SessionDTO} session */
        generateRefreshToken(session) {
            return tryCatch(() =>
                ok(
                    jwt.sign(
                        {
                            sub: session.userId,
                            jti: session.jti,
                            sessionId: session.id,
                            type: 'refresh'
                        },
                        config.jwtSecret,
                        {
                            expiresIn: config.refreshTokenTTL
                        }
                    )
                )
            )
        },

        /** @param {string} token */
        verifyAccessToken(token) {
            return tryCatch(() =>
                ok(parseTokenPayload(jwt.verify(token, config.jwtSecret), 'access'))
            )
        },

        /** @param {string} token */
        verifyRefreshToken(token) {
            return tryCatch(() =>
                ok(parseTokenPayload(jwt.verify(token, config.jwtSecret), 'refresh'))
            )
        },

        /** @param {string} password */
        hashPassword(password) {
            return tryCatchAsync(async () => ok(await bcrypt.hash(password, 10)))
        },

        /** @param {string} password */
        /** @param {string} hash */
        comparePassword(password, hash) {
            return tryCatchAsync(async () => {
                const match = await bcrypt.compare(password, hash)
                if (!match) return failure(TokenServiceFailuresEnum.NO_MATCH)
                return ok(true)
            })
        }
    }
}
