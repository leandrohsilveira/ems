/**
 * JWT Access token payload
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
 */
export type RefreshTokenPayload = {
    sub: string
    jti: string
    sessionId: string
    iat: number
    exp: number
    type: 'refresh'
}
