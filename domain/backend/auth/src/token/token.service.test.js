import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTokenService } from './token.service'

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(() => 'mock-signed-token'),
        verify: vi.fn((token) => {
            if (token === 'refresh-token') {
                return {
                    sub: 'user-1',
                    jti: 'token-123',
                    sessionId: 'session-1',
                    type: 'refresh',
                    iat: 1700000000,
                    exp: 1700001800
                }
            }
            return {
                sub: 'user-1',
                username: 'testuser',
                role: 'USER',
                jti: 'token-123',
                type: 'access',
                iat: 1700000000,
                exp: 1700000300
            }
        })
    }
}))

vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn(() => 'hashed-password'),
        compare: vi.fn(() => true)
    }
}))

describe('createTokenService', () => {
    /** @type {import('@ems/types-backend-auth').TokenService} */
    let tokenService

    const mockConfig = {
        jwtSecret: 'test-secret',
        accessTokenTTL: 300,
        refreshTokenTTL: 1800,
        refreshTokenMobileTTL: 604800
    }

    const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        jti: 'token-123',
        lastRefresh: new Date(),
        expiresAt: new Date(),
        user: {
            userId: 'user-1',
            username: 'testuser',
            firstName: 'John',
            lastName: 'Doe',
            email: 'test@example.com',
            role: 'USER'
        }
    }

    beforeEach(() => {
        tokenService = createTokenService(mockConfig)
    })

    describe('generateAccessToken', () => {
        it('should generate access token', () => {
            const token = tokenService.generateAccessToken(mockSession)
            expect(token).toBe('mock-signed-token')
        })
    })

    describe('generateRefreshToken', () => {
        it('should generate refresh token', () => {
            const token = tokenService.generateRefreshToken(mockSession)
            expect(token).toBe('mock-signed-token')
        })
    })

    describe('verifyAccessToken', () => {
        it('should verify and return payload', () => {
            const payload = tokenService.verifyAccessToken('access-token')
            expect(payload.sub).toBe('user-1')
            expect(payload.type).toBe('access')
        })
    })

    describe('verifyRefreshToken', () => {
        it('should verify and return payload', () => {
            const payload = tokenService.verifyRefreshToken('refresh-token')
            expect(payload.sessionId).toBe('session-1')
            expect(payload.type).toBe('refresh')
        })
    })

    describe('hashPassword', () => {
        it('should hash password', async () => {
            const hash = await tokenService.hashPassword('password')
            expect(hash).toBe('hashed-password')
        })
    })

    describe('comparePassword', () => {
        it('should return true for matching password', async () => {
            const result = await tokenService.comparePassword('password', 'hash')
            expect(result).toBe(true)
        })
    })
})
