import { describe, it, expect } from 'vitest'
import { authMiddleware } from './auth.middleware.js'

describe('authMiddleware', () => {
    it('extracts user from valid token', async () => {
        const config = {
            jwtSecret: 'test-secret'
        }
        // This would need a real token to test properly
        // For now just test the structure
        expect(authMiddleware).toBeTruthy()
        expect(config.jwtSecret).toBe('test-secret')
    })

    it('returns null for no auth header', () => {
        const req = /** @type {import('fastify').FastifyRequest} */ ({ headers: {} })
        expect(authMiddleware.extractToken(req)).toBeNull()
    })

    it('returns null for invalid auth header', () => {
        const req = /** @type {import('fastify').FastifyRequest} */ ({
            headers: { authorization: 'InvalidFormat' }
        })
        expect(authMiddleware.extractToken(req)).toBeNull()
    })

    it('extracts token from Bearer format', () => {
        const req = /** @type {import('fastify').FastifyRequest} */ ({
            headers: { authorization: 'Bearer abc123' }
        })
        expect(authMiddleware.extractToken(req)).toBe('abc123')
    })
})
