import type { AccessTokenPayload, RefreshTokenPayload } from './jwt-payload.js'
import type { Session } from './session.js'

export interface TokenService {
    generateAccessToken(session: Session): string
    generateRefreshToken(session: Session): string
    verifyAccessToken(token: string): AccessTokenPayload
    verifyRefreshToken(token: string): RefreshTokenPayload
    hashPassword(password: string): Promise<string>
    comparePassword(password: string, hash: string): Promise<boolean>
}
