export type AccessTokenPayloadDTO = {
    sub: string
    username: string
    role: string
    jti: string
    iat: number
    exp: number
    type: 'access'
}

export type RefreshTokenPayloadDTO = {
    sub: string
    jti: string
    sessionId: string
    iat: number
    exp: number
    type: 'refresh'
}
