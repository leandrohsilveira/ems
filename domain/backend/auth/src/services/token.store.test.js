import { describe, it, expect, beforeEach } from 'vitest'
import { tokenStore, clearTokens } from './token.store.js'

describe('tokenStore', () => {
    beforeEach(() => {
        clearTokens()
    })

    it('stores refresh token', () => {
        tokenStore.store(
            {
                jti: 'test-token-1',
                userId: 'usr_001',
                expiresAt: new Date(Date.now() + 86400000),
                createdAt: new Date()
            },
            'raw-token-1'
        )
        const stored = tokenStore.findByJti('test-token-1')
        expect(stored).not.toBeNull()
        expect(stored?.jti).toBe('test-token-1')
    })

    it('finds token by jti', () => {
        tokenStore.store(
            {
                jti: 'test-token-2',
                userId: 'usr_001',
                expiresAt: new Date(Date.now() + 86400000),
                createdAt: new Date()
            },
            'raw-token-2'
        )
        const found = tokenStore.findByJti('test-token-2')
        expect(found).toBeTruthy()
    })

    it('returns null for non-existent jti', () => {
        const found = tokenStore.findByJti('non-existent')
        expect(found).toBeNull()
    })

    it('removes token by jti', () => {
        tokenStore.store(
            {
                jti: 'test-token-3',
                userId: 'usr_001',
                expiresAt: new Date(Date.now() + 86400000),
                createdAt: new Date()
            },
            'raw-token-3'
        )
        tokenStore.removeByJti('test-token-3')
        const found = tokenStore.findByJti('test-token-3')
        expect(found).toBeNull()
    })

    it('removes all tokens for user', () => {
        tokenStore.store(
            {
                jti: 'token-1',
                userId: 'usr_001',
                expiresAt: new Date(Date.now() + 86400000),
                createdAt: new Date()
            },
            'raw-token-1'
        )
        tokenStore.store(
            {
                jti: 'token-2',
                userId: 'usr_001',
                expiresAt: new Date(Date.now() + 86400000),
                createdAt: new Date()
            },
            'raw-token-2'
        )
        tokenStore.removeAllForUser('usr_001')
        expect(tokenStore.findByJti('token-1')).toBeNull()
        expect(tokenStore.findByJti('token-2')).toBeNull()
    })

    it('clears expired tokens', async () => {
        tokenStore.store(
            {
                jti: 'expired-token',
                userId: 'usr_001',
                expiresAt: new Date(Date.now() - 1000),
                createdAt: new Date(Date.now() - 2000)
            },
            'raw-expired-token'
        )
        const removed = tokenStore.cleanupExpired()
        expect(removed).toBe(1)
        expect(tokenStore.findByJti('expired-token')).toBeNull()
    })

    it('verifies token correctly', () => {
        tokenStore.store(
            {
                jti: 'verify-token',
                userId: 'usr_001',
                expiresAt: new Date(Date.now() + 86400000),
                createdAt: new Date()
            },
            'correct-raw-token'
        )

        expect(tokenStore.verifyToken('verify-token', 'correct-raw-token')).toBe(true)
        expect(tokenStore.verifyToken('verify-token', 'wrong-raw-token')).toBe(false)
    })
})
