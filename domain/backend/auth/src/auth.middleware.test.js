import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'
import authMiddleware from './auth.middleware.js'
import { PERMISSIONS } from './permissions/permissions.js'

describe('authMiddleware', () => {
    /** @type {ReturnType<typeof Fastify>} */
    let fastify
    /** @type {ReturnType<typeof vi.fn>} */
    let mockMe
    /** @type {import('@ems/types-backend-auth').AuthService} */
    let mockAuthService

    beforeEach(async () => {
        mockMe = vi.fn()
        mockAuthService = /** @type {*} */ ({ me: mockMe })
        fastify = Fastify()
        await fastify.register(authMiddleware, { authService: mockAuthService })
        await fastify.get(
            '/test',
            {
                preHandler: fastify.authenticate
            },
            async (/** @type {import('fastify').FastifyRequest} */ req) => {
                return { user: req.user }
            }
        )

        // Add route for testing allowOneOf
        await fastify.get(
            '/test-permission',
            {
                preHandler: fastify.allowOneOf([PERMISSIONS.USER_READ, PERMISSIONS.USER_WRITE])
            },
            async (/** @type {import('fastify').FastifyRequest} */ req) => {
                return { user: req.user }
            }
        )
    })

    it('should return 401 when no authorization header', async () => {
        await fastify.ready()

        const response = await fastify.inject({
            method: 'GET',
            url: '/test'
        })

        expect(mockMe).not.toHaveBeenCalled()
        expect(response.statusCode).toBe(401)
        expect(response.json()).toEqual({ error: 'Authorization header required' })
    })

    it('should return 401 when authorization header is not Bearer', async () => {
        await fastify.ready()

        const response = await fastify.inject({
            method: 'GET',
            url: '/test',
            headers: { authorization: 'Basic abc123' }
        })

        expect(mockMe).not.toHaveBeenCalled()
        expect(response.statusCode).toBe(401)
        expect(response.json()).toEqual({ error: 'Invalid authorization format' })
    })

    it('should return 401 when Bearer token is empty', async () => {
        await fastify.ready()

        const response = await fastify.inject({
            method: 'GET',
            url: '/test',
            headers: { authorization: 'Bearer ' }
        })

        expect(mockMe).not.toHaveBeenCalled()
        expect(response.statusCode).toBe(401)
        expect(response.json()).toEqual({ error: 'Token missing' })
    })

    describe('allowOneOf', () => {
        it('should return 401 when user is not authenticated', async () => {
            await fastify.ready()

            const response = await fastify.inject({
                method: 'GET',
                url: '/test-permission'
            })

            expect(response.statusCode).toBe(401)
            expect(response.json()).toEqual({ error: 'Authorization header required' })
        })

        it('should return 403 when authenticated user does not have any required permission', async () => {
            const mockUser = {
                userId: 'user-1',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                role: 'USER' // USER role only has AUTH_ME permission
            }

            mockMe.mockResolvedValue({ user: mockUser })

            await fastify.ready()

            const response = await fastify.inject({
                method: 'GET',
                url: '/test-permission',
                headers: { authorization: 'Bearer valid-token' }
            })

            expect(mockMe).toHaveBeenCalledWith('valid-token')
            expect(response.statusCode).toBe(403)
            expect(response.json()).toEqual({ error: 'Insufficient permissions' })
        })

        it('should allow access when user has at least one required permission', async () => {
            const mockUser = {
                userId: 'user-1',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                role: 'MANAGER' // MANAGER role has USER_READ permission
            }

            mockMe.mockResolvedValue({ user: mockUser })

            await fastify.ready()

            const response = await fastify.inject({
                method: 'GET',
                url: '/test-permission',
                headers: { authorization: 'Bearer valid-token' }
            })

            expect(mockMe).toHaveBeenCalledWith('valid-token')
            expect(response.statusCode).toBe(200)
            expect(response.json()).toEqual({ user: mockUser })
        })

        it('should allow access when user has multiple required permissions', async () => {
            const mockUser = {
                userId: 'user-1',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                role: 'ADMIN' // ADMIN role has both USER_READ and USER_WRITE
            }

            mockMe.mockResolvedValue({ user: mockUser })

            await fastify.ready()

            const response = await fastify.inject({
                method: 'GET',
                url: '/test-permission',
                headers: { authorization: 'Bearer valid-token' }
            })

            expect(mockMe).toHaveBeenCalledWith('valid-token')
            expect(response.statusCode).toBe(200)
            expect(response.json()).toEqual({ user: mockUser })
        })

        it('should return 403 when permissions array is empty', async () => {
            // Add a route with empty permissions array
            await fastify.get(
                '/test-empty-permissions',
                {
                    preHandler: fastify.allowOneOf([])
                },
                async (/** @type {import('fastify').FastifyRequest} */ req) => {
                    return { user: req.user }
                }
            )

            const mockUser = {
                userId: 'user-1',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                role: 'ADMIN'
            }

            mockMe.mockResolvedValue({ user: mockUser })

            await fastify.ready()

            const response = await fastify.inject({
                method: 'GET',
                url: '/test-empty-permissions',
                headers: { authorization: 'Bearer valid-token' }
            })

            expect(mockMe).toHaveBeenCalledWith('valid-token')
            expect(response.statusCode).toBe(403)
            expect(response.json()).toEqual({ error: 'Insufficient permissions' })
        })

        it('should handle invalid permission strings gracefully', async () => {
            // Add a route with invalid permission
            await fastify.get(
                '/test-invalid-permission',
                {
                    preHandler: fastify.allowOneOf(['invalid:permission'])
                },
                async (/** @type {import('fastify').FastifyRequest} */ req) => {
                    return { user: req.user }
                }
            )

            const mockUser = {
                userId: 'user-1',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                role: 'ADMIN'
            }

            mockMe.mockResolvedValue({ user: mockUser })

            await fastify.ready()

            const response = await fastify.inject({
                method: 'GET',
                url: '/test-invalid-permission',
                headers: { authorization: 'Bearer valid-token' }
            })

            expect(mockMe).toHaveBeenCalledWith('valid-token')
            expect(response.statusCode).toBe(403)
            expect(response.json()).toEqual({ error: 'Insufficient permissions' })
        })
    })

    it('should set req.user when valid Bearer token and authService.me succeeds', async () => {
        const mockUser = {
            userId: 'user-1',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            role: 'USER'
        }

        mockMe.mockResolvedValue({ user: mockUser })

        await fastify.ready()

        const response = await fastify.inject({
            method: 'GET',
            url: '/test',
            headers: { authorization: 'Bearer valid-token' }
        })

        expect(mockMe).toHaveBeenCalledWith('valid-token')
        expect(response.statusCode).toBe(200)
        expect(response.json()).toEqual({ user: mockUser })
    })

    it('should return 401 when valid Bearer token but authService.me throws', async () => {
        mockMe.mockRejectedValue(new Error('Invalid token'))

        await fastify.ready()

        const response = await fastify.inject({
            method: 'GET',
            url: '/test',
            headers: { authorization: 'Bearer invalid-token' }
        })

        expect(mockMe).toHaveBeenCalledWith('invalid-token')
        expect(response.statusCode).toBe(401)
        expect(response.json()).toEqual({
            error: 'Invalid or expired token',
            message: 'Invalid token'
        })
    })
})
