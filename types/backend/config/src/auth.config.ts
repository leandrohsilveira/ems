export interface AuthConfig {
    jwtSecret: string
    accessTokenTTL: number
    refreshTokenTTL: number
    refreshTokenMobileTTL: number
}
