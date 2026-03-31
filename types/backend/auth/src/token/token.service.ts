import type { AccessTokenPayloadDTO, RefreshTokenPayloadDTO } from '../session/jwt-payload'
import type { SessionDTO } from '../session/session'

export interface TokenService {
    generateAccessToken(session: SessionDTO): string
    generateRefreshToken(session: SessionDTO): string
    verifyAccessToken(token: string): AccessTokenPayloadDTO
    verifyRefreshToken(token: string): RefreshTokenPayloadDTO
    hashPassword(password: string): Promise<string>
    comparePassword(password: string, hash: string): Promise<boolean>
}
