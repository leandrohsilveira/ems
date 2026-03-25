import { describe, it, expect, beforeEach } from 'vitest'
import { authService } from './auth.service.js'
import { seedUsers } from './user.store.js'
import { clearTokens } from './token.store.js'

const testConfig = {
    jwtSecret: 'test-secret-key',
    accessTokenTtl: 900,
    refreshTokenTtl: 604800
}

describe('authService', () => {
    beforeEach(() => {
        seedUsers()
        clearTokens()
    })

    describe('login', () => {
        it('returns tokens for valid credentials', async () => {
            const result = await authService.login('admin', 'admin123', testConfig)
            expect(result).toBeTruthy()
            expect(result.accessToken).toBeTruthy()
            expect(result.refreshToken).toBeTruthy()
            expect(result.expiresIn).toBe(900)
            expect(result.tokenType).toBe('Bearer')
        })

        it('throws for invalid username', async () => {
            await expect(authService.login('nonexistent', 'password', testConfig)).rejects.toThrow(
                'Invalid credentials'
            )
        })

        it('throws for invalid password', async () => {
            await expect(authService.login('admin', 'wrongpassword', testConfig)).rejects.toThrow(
                'Invalid credentials'
            )
        })
    })

    describe('refresh', () => {
        it('returns new tokens for valid refresh token', async () => {
            const loginResult = await authService.login('admin', 'admin123', testConfig)
            const refreshResult = await authService.refresh(loginResult.refreshToken, testConfig)
            expect(refreshResult).toBeTruthy()
            expect(refreshResult.accessToken).toBeTruthy()
            expect(refreshResult.refreshToken).toBeTruthy()
        })

        it('throws for invalid refresh token', async () => {
            await expect(authService.refresh('invalid-token', testConfig)).rejects.toThrow(
                'Invalid refresh token'
            )
        })

        it('throws for tampered refresh token', async () => {
            const loginResult = await authService.login('admin', 'admin123', testConfig)
            const tamperedToken = loginResult.refreshToken.slice(0, -5) + 'xxxxx'
            await expect(authService.refresh(tamperedToken, testConfig)).rejects.toThrow(
                'Invalid refresh token'
            )
        })
    })

    describe('logout', () => {
        it('revokes refresh token', async () => {
            const loginResult = await authService.login('admin', 'admin123', testConfig)
            await authService.logout(loginResult.refreshToken, testConfig)
            await expect(authService.refresh(loginResult.refreshToken, testConfig)).rejects.toThrow(
                'Invalid refresh token'
            )
        })

        it('handles invalid token gracefully', async () => {
            await expect(authService.logout('invalid-token', testConfig)).resolves.not.toThrow()
        })
    })

    describe('revokeAll', () => {
        it('revokes all refresh tokens for user', async () => {
            const loginResult1 = await authService.login('admin', 'admin123', testConfig)
            const loginResult2 = await authService.login('admin', 'admin123', testConfig)
            await authService.revokeAll('usr_001')
            await expect(
                authService.refresh(loginResult1.refreshToken, testConfig)
            ).rejects.toThrow('Invalid refresh token')
            await expect(
                authService.refresh(loginResult2.refreshToken, testConfig)
            ).rejects.toThrow('Invalid refresh token')
        })
    })

    describe('verifyAccessToken', () => {
        it('returns user info for valid access token', async () => {
            const loginResult = await authService.login('admin', 'admin123', testConfig)
            const user = await authService.verifyAccessToken(loginResult.accessToken, testConfig)
            expect(user).toBeTruthy()
            expect(user.userId).toBe('usr_001')
            expect(user.username).toBe('admin')
            expect(user.roles).toContain('admin')
        })

        it('throws for invalid access token', async () => {
            await expect(
                authService.verifyAccessToken('invalid-token', testConfig)
            ).rejects.toThrow('Invalid access token')
        })

        it('throws for malformed token', async () => {
            await expect(
                authService.verifyAccessToken('not.a.valid.jwt', testConfig)
            ).rejects.toThrow('Invalid access token')
        })
    })
})
