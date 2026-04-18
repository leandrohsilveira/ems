import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import Fastify from 'fastify'
import schemaPlugin from '@ems/domain-backend-schema'
import authPlugin from './plugin.js'
import { randomUUID } from 'crypto'

/**
 * @import { TokenDTO, UserDTO } from '@ems/domain-shared-auth'
 * @import { AuthService } from './auth.service.js'
 * @import { UserService } from './user/index.js'
 * @import { SessionDTO } from './session/index.js'
 */

describe('Auth Plugin', () => {
    /** @type {import('vitest-mock-extended').DeepMockProxy<AuthService>} */
    let mockAuthService
    /** @type {import('vitest-mock-extended').DeepMockProxy<UserService>} */
    let mockUserService

    beforeEach(() => {
        mockAuthService = mockDeep()
        mockUserService = mockDeep()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('POST /login', () => {
        it('should call authService.login and return 200 on success', async () => {
            /** @type {TokenDTO} */
            const mockResponse = {
                accessToken: 'test-access-token',
                refreshToken: 'test-refresh-token',
                expiresIn: 300,
                issuedAt: '2024-01-01T00:00:00.000Z',
                tokenType: 'Bearer'
            }
            mockAuthService.login.mockResolvedValue(mockResponse)

            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'POST',
                url: '/login',
                payload: {
                    username: 'testuser',
                    password: 'testpass'
                }
            })

            expect(response.statusCode).toBe(200)
            expect(response.json()).toEqual(mockResponse)
            expect(mockAuthService.login).toHaveBeenCalledWith({
                username: 'testuser',
                password: 'testpass'
            })
        })

        it('should return 401 on authentication failure', async () => {
            mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'))

            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'POST',
                url: '/login',
                payload: {
                    username: 'testuser',
                    password: 'wrongpass'
                }
            })

            expect(response.statusCode).toBe(401)
            expect(response.json()).toEqual({
                message: 'Invalid credentials'
            })
        })
    })

    describe('POST /refresh', () => {
        it('should call authService.refresh and return 200 on success', async () => {
            /** @type {TokenDTO} */
            const mockResponse = {
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
                expiresIn: 300,
                issuedAt: '2024-01-01T00:00:00.000Z',
                tokenType: 'Bearer'
            }
            mockAuthService.refresh.mockResolvedValue(mockResponse)

            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'POST',
                url: '/refresh',
                payload: {
                    refreshToken: 'old-refresh-token'
                }
            })

            expect(response.statusCode).toBe(200)
            expect(response.json()).toEqual(mockResponse)
            expect(mockAuthService.refresh).toHaveBeenCalledWith({
                refreshToken: 'old-refresh-token'
            })
        })
    })

    describe('POST /logout', () => {
        it('should call authService.logout and return 200 on success', async () => {
            const mockResponse = { message: 'Logged out successfully' }
            mockAuthService.logout.mockResolvedValue(mockResponse)

            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'POST',
                url: '/logout',
                payload: {
                    refreshToken: 'refresh-token-to-logout'
                }
            })

            expect(mockAuthService.logout).toHaveBeenCalledWith({
                refreshToken: 'refresh-token-to-logout'
            })
            expect(response.json()).toEqual(mockResponse)
            expect(response.statusCode).toBe(200)
        })
    })

    describe('POST /revoke-all', () => {
        it('should return 401 when not authenticated', async () => {
            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'POST',
                url: '/revoke-all',
                payload: {
                    userId: 'user-123'
                }
            })

            expect(response.statusCode).toBe(401)
            expect(response.json()).toEqual({
                message: 'Authorization header required'
            })
            expect(mockAuthService.revokeAll).not.toHaveBeenCalled()
        })

        it('should call authService.revokeAll when authenticated', async () => {
            const mockUser = {
                userId: 'user-123',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                role: 'ADMIN'
            }

            const mockResponse = { message: 'All sessions revoked' }
            mockAuthService.revokeAll.mockResolvedValue(mockResponse)
            mockAuthService.me.mockResolvedValue(
                /** @type {SessionDTO} */ ({
                    id: 'session-1',
                    userId: 'user-123',
                    jti: 'jti-1',
                    lastRefresh: new Date(),
                    expiresAt: new Date(Date.now() + 3600000),
                    user: mockUser
                })
            )

            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'POST',
                url: '/revoke-all',
                headers: {
                    authorization: 'Bearer valid-token'
                },
                payload: {
                    userId: 'user-123'
                }
            })

            expect(response.statusCode).toBe(200)
            expect(response.json()).toEqual(mockResponse)
            expect(mockAuthService.me).toHaveBeenCalledWith('valid-token')
            expect(mockAuthService.revokeAll).toHaveBeenCalledWith({ userId: 'user-123' })
        })
    })

    describe('GET /me', () => {
        it('should return 401 when not authenticated', async () => {
            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'GET',
                url: '/me'
            })

            expect(response.statusCode).toBe(401)
            expect(response.json()).toEqual({
                message: 'Authorization header required'
            })
        })

        it('should return user info when authenticated', async () => {
            const userId = crypto.randomUUID()

            /** @type {UserDTO} */
            const mockUser = {
                userId,
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                role: 'USER'
            }

            mockAuthService.me.mockResolvedValue(
                /** @type {SessionDTO} */ ({
                    id: 'session-1',
                    userId,
                    jti: 'jti-1',
                    lastRefresh: new Date(),
                    expiresAt: new Date(Date.now() + 3600000),
                    user: mockUser
                })
            )

            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'GET',
                url: '/me',
                headers: {
                    authorization: 'Bearer valid-token'
                }
            })

            expect(mockAuthService.me).toHaveBeenCalledWith('valid-token')
            expect(response.json()).toEqual({ user: mockUser })
            expect(response.statusCode).toBe(200)
        })
    })

    describe('POST /signup', () => {
        it('should call userService.signup and return 201 on success', async () => {
            /** @type {UserDTO} */
            const mockUser = {
                userId: randomUUID(),
                username: 'testuser',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'USER'
            }
            mockUserService.signup.mockResolvedValue(mockUser)

            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'POST',
                url: '/signup',
                payload: {
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'Password123',
                    firstName: 'Test',
                    lastName: 'User'
                }
            })

            expect(response.statusCode).toBe(201)
            expect(response.json()).toEqual({ user: mockUser })
            expect(mockUserService.signup).toHaveBeenCalledWith({
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123',
                firstName: 'Test',
                lastName: 'User'
            })
        })

        it('should return 400 with validation errors when email is invalid', async () => {
            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'POST',
                url: '/signup',
                payload: {
                    username: 'testuser',
                    email: 'invalid-email', // Valid email
                    password: 'Password123', // Valid password
                    firstName: 'Test',
                    lastName: 'User'
                }
            })

            expect(mockUserService.signup).not.toHaveBeenCalled()
            expect(response.json()).toMatchObject({
                fields: {
                    email: ['Must enter a valid e-mail address']
                }
            })
            expect(response.statusCode).toBe(400)
        })

        it('should return 409 on duplicate user error', async () => {
            mockUserService.signup.mockRejectedValue(
                new Error('User with this username or email already exists')
            )

            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'POST',
                url: '/signup',
                payload: {
                    username: 'existinguser',
                    email: 'existing@example.com',
                    password: 'Password123',
                    firstName: 'Existing',
                    lastName: 'User'
                }
            })

            expect(response.json()).toEqual({
                message: 'User with this username or email already exists'
            })
            expect(response.statusCode).toBe(409)
        })

        it('should return 500 on other errors', async () => {
            mockUserService.signup.mockRejectedValue(new Error('Database connection failed'))

            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            const response = await app.inject({
                method: 'POST',
                url: '/signup',
                payload: {
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'Password123',
                    firstName: 'Test',
                    lastName: 'User'
                }
            })

            expect(response.json()).toEqual({
                message: 'Database connection failed'
            })
            expect(response.statusCode).toBe(500)
        })

        it('should validate request body against schema', async () => {
            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            // Test missing required field
            const response = await app.inject({
                method: 'POST',
                url: '/signup',
                payload: {
                    username: 'testuser',
                    email: 'test@example.com',
                    firstName: null,
                    lastName: null,
                    password: null
                }
            })

            expect(mockUserService.signup).not.toHaveBeenCalled()
            expect(response.statusCode).toBe(400)
            expect(response.json()).toMatchObject({
                fields: {
                    password: ['Must enter a valid password']
                }
            })
        })

        it('should validate string length constraints', async () => {
            const app = Fastify()
            await app.register(schemaPlugin)
            await app.register(authPlugin, {
                authService: mockAuthService,
                userService: mockUserService
            })

            // Test username too short
            const response = await app.inject({
                method: 'POST',
                url: '/signup',
                payload: {
                    username: 'ab', // Too short (minLength: 3)
                    email: 'test@example.com',
                    password: 'Password123',
                    firstName: 'Test',
                    lastName: 'User'
                }
            })

            expect(mockUserService.signup).not.toHaveBeenCalled()
            expect(response.json()).toMatchObject({
                fields: {
                    username: ['Username must be at least 3 characters']
                }
            })
            expect(response.statusCode).toBe(400)
        })
    })
})
