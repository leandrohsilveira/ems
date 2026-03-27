/**
 * JWT Access token payload
 * @typedef {Object} AccessTokenPayload
 * @property {string} sub - userId
 * @property {string} username
 * @property {string} role
 * @property {string} jti - unique token ID
 * @property {number} iat
 * @property {number} exp
 * @property {"access"} type
 */
export type AccessTokenPayload = {
    sub: string
    username: string
    role: string
    jti: string
    iat: number
    exp: number
    type: 'access'
}

/**
 * JWT Refresh token payload
 * @typedef {Object} RefreshTokenPayload
 * @property {string} sub - userId
 * @property {string} jti - unique token ID
 * @property {string} sessionId
 * @property {number} iat
 * @property {number} exp
 * @property {"refresh"} type
 */
export type RefreshTokenPayload = {
    sub: string
    jti: string
    sessionId: string
    iat: number
    exp: number
    type: 'refresh'
}
