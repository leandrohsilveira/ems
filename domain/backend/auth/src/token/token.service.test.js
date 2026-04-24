import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ok } from '@ems/utils'
import { createTokenService } from './token.service.js'
import { ROLES } from '@ems/domain-shared-auth'

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
    /** @type {import('./token.service.js').TokenService} */
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
            role: ROLES.USER
        }
    }

    beforeEach(() => {
        tokenService = createTokenService(mockConfig)
    })

    describe('generateAccessToken', () => {
        it('should generate access token', () => {
            const result = tokenService.generateAccessToken(mockSession)

            expect(result).toEqual(ok('mock-signed-token'))
        })
    })

    describe('generateRefreshToken', () => {
        it('should generate refresh token', () => {
            const result = tokenService.generateRefreshToken(mockSession)

            expect(result).toEqual(ok('mock-signed-token'))
        })
    })

    describe('verifyAccessToken', () => {
        it('should verify and return payload', () => {
            const result = tokenService.verifyAccessToken('access-token')

            expect(result).toEqual(ok(expect.objectContaining({ sub: 'user-1', type: 'access' })))
        })
    })

    describe('verifyRefreshToken', () => {
        it('should verify and return payload', () => {
            const result = tokenService.verifyRefreshToken('refresh-token')

            expect(result).toEqual(
                ok(expect.objectContaining({ sessionId: 'session-1', type: 'refresh' }))
            )
        })
    })

    describe('hashPassword', () => {
        it('should hash password', async () => {
            const result = await tokenService.hashPassword('password')

            expect(result).toEqual(ok('hashed-password'))
        })
    })

    describe('comparePassword', () => {
        it('should return true for matching password', async () => {
            const result = await tokenService.comparePassword('password', 'hash')

            expect(result).toEqual(ok(true))
        })
    })
})
