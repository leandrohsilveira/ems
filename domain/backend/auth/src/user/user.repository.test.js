import { describe, it, expect, beforeEach } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { createUserRepository } from './user.repository.js'
import { createMockUser } from '../testing/user.js'

describe('createUserRepository', () => {
    /** @type {import('./user.repository.js').UserRepository} */
    let userRepository
    /** @type {import('vitest-mock-extended').DeepMockProxy<import('@ems/database').PrismaClient>} */
    let mockDb

    beforeEach(() => {
        mockDb = mockDeep()
        userRepository = createUserRepository(mockDb)
    })

    describe('findByUsername', () => {
        it('should return user when found', async () => {
            const mockUser = createMockUser({ username: 'testuser' })
            mockDb.user.findUnique.mockResolvedValue(mockUser)

            const result = await userRepository.findByUsername('testuser')

            expect(result).toEqual(mockUser)
            expect(mockDb.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'testuser' }
            })
        })

        it('should return null when user not found', async () => {
            mockDb.user.findUnique.mockResolvedValue(null)

            const result = await userRepository.findByUsername('nonexistent')

            expect(result).toBeNull()
            expect(mockDb.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'nonexistent' }
            })
        })
    })

    describe('findById', () => {
        it('should return user when found', async () => {
            const mockUser = createMockUser({ id: 'user-1' })
            mockDb.user.findUnique.mockResolvedValue(mockUser)

            const result = await userRepository.findById('user-1')

            expect(result).toEqual(mockUser)
            expect(mockDb.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user-1' }
            })
        })

        it('should return null when user not found', async () => {
            mockDb.user.findUnique.mockResolvedValue(null)

            const result = await userRepository.findById('nonexistent-id')

            expect(result).toBeNull()
            expect(mockDb.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'nonexistent-id' }
            })
        })
    })

    describe('create', () => {
        it('should create user with valid data', async () => {
            /** @type {import('@ems/database').UserCreateInput} */
            const userData = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'hashed123',
                role: 'USER'
            }
            const mockUser = createMockUser({ id: 'user-123', ...userData })
            mockDb.user.create.mockResolvedValue(mockUser)

            const result = await userRepository.create(userData)

            expect(result).toEqual(mockUser)
            expect(mockDb.user.create).toHaveBeenCalledWith({ data: userData })
        })

        it('should propagate Prisma unique constraint error for duplicate username', async () => {
            /** @type {import('@ems/database').UserCreateInput} */
            const userData = {
                username: 'duplicate',
                email: 'unique@example.com',
                password: 'hash',
                role: 'USER'
            }
            const prismaError = new Error('Unique constraint failed on the fields: (`username`)')
            mockDb.user.create.mockRejectedValue(prismaError)

            await expect(userRepository.create(userData)).rejects.toThrow(
                'Unique constraint failed on the fields: (`username`)'
            )
        })

        it('should propagate Prisma unique constraint error for duplicate email', async () => {
            /** @type {import('@ems/database').UserCreateInput} */
            const userData = {
                username: 'unique',
                email: 'duplicate@example.com',
                password: 'hash',
                role: 'USER'
            }
            const prismaError = new Error('Unique constraint failed on the fields: (`email`)')
            mockDb.user.create.mockRejectedValue(prismaError)

            await expect(userRepository.create(userData)).rejects.toThrow(
                'Unique constraint failed on the fields: (`email`)'
            )
        })

        it('should handle missing optional fields', async () => {
            /** @type {import('@ems/database').UserCreateInput} */
            const userData = {
                username: 'minimal',
                email: 'min@example.com',
                password: 'hash',
                role: 'USER'
                // No firstName, lastName
            }
            const mockUser = createMockUser({
                id: 'user-min',
                ...userData,
                firstName: null,
                lastName: null
            })
            mockDb.user.create.mockResolvedValue(mockUser)

            const result = await userRepository.create(userData)
            expect(result).toEqual(mockUser)
        })

        it('should handle null values for optional fields', async () => {
            /** @type {import('@ems/database').UserCreateInput} */
            const userData = {
                username: 'withnull',
                email: 'null@example.com',
                password: 'hash',
                firstName: null,
                lastName: null,
                role: 'USER'
            }
            const mockUser = createMockUser({ id: 'user-null', ...userData })
            mockDb.user.create.mockResolvedValue(mockUser)

            const result = await userRepository.create(userData)
            expect(result).toEqual(mockUser)
        })

        it('should handle MANAGER and ADMIN roles', async () => {
            /** @type {import('@ems/database').UserCreateInput} */
            const userData = {
                username: 'adminuser',
                email: 'admin@example.com',
                password: 'hash',
                role: 'ADMIN'
            }
            /** @type {Partial<import('@ems/database').User>} */
            const mockUserOverrides = { id: 'user-admin', ...userData }
            const mockUser = createMockUser(mockUserOverrides)
            mockDb.user.create.mockResolvedValue(mockUser)

            const result = await userRepository.create(userData)
            expect(result.role).toBe('ADMIN')
        })
    })

    describe('findByEmail', () => {
        it('should return user when found by email', async () => {
            const mockUser = createMockUser({ email: 'test@example.com' })
            mockDb.user.findUnique.mockResolvedValue(mockUser)

            const result = await userRepository.findByEmail('test@example.com')

            expect(result).toEqual(mockUser)
            expect(mockDb.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' }
            })
        })

        it('should return null when email not found', async () => {
            mockDb.user.findUnique.mockResolvedValue(null)

            const result = await userRepository.findByEmail('nonexistent@example.com')

            expect(result).toBeNull()
            expect(mockDb.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'nonexistent@example.com' }
            })
        })

        it('should handle empty string email', async () => {
            mockDb.user.findUnique.mockResolvedValue(null)

            const result = await userRepository.findByEmail('')

            expect(result).toBeNull()
            expect(mockDb.user.findUnique).toHaveBeenCalledWith({ where: { email: '' } })
        })

        it('should handle email with special characters', async () => {
            const mockUser = createMockUser({ email: 'test+tag@example.com' })
            mockDb.user.findUnique.mockResolvedValue(mockUser)

            const result = await userRepository.findByEmail('test+tag@example.com')

            expect(result).toEqual(mockUser)
        })

        it('should handle case-sensitive email lookup as provided', async () => {
            const mockUser = createMockUser({ email: 'Test@Example.com' })
            mockDb.user.findUnique.mockResolvedValue(mockUser)

            const result = await userRepository.findByEmail('Test@Example.com')

            expect(result).toEqual(mockUser)
            expect(mockDb.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'Test@Example.com' }
            })
        })
    })

    describe('findByUsernameOrEmail', () => {
        it('should return user when username exists', async () => {
            const mockUser = createMockUser({ username: 'existing' })
            mockDb.user.findFirst.mockResolvedValue(mockUser)

            const result = await userRepository.findByUsernameOrEmail('existing', 'new@example.com')

            expect(result).toEqual(mockUser)
            expect(mockDb.user.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [{ username: 'existing' }, { email: 'new@example.com' }]
                }
            })
        })

        it('should return user when email exists', async () => {
            const mockUser = createMockUser({ email: 'existing@example.com' })
            mockDb.user.findFirst.mockResolvedValue(mockUser)

            const result = await userRepository.findByUsernameOrEmail(
                'newuser',
                'existing@example.com'
            )

            expect(result).toEqual(mockUser)
            expect(mockDb.user.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [{ username: 'newuser' }, { email: 'existing@example.com' }]
                }
            })
        })

        it('should return null when neither username nor email exists', async () => {
            mockDb.user.findFirst.mockResolvedValue(null)

            const result = await userRepository.findByUsernameOrEmail('newuser', 'new@example.com')

            expect(result).toBeNull()
            expect(mockDb.user.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [{ username: 'newuser' }, { email: 'new@example.com' }]
                }
            })
        })

        it('should return user when both username and email match same user', async () => {
            const mockUser = createMockUser({
                username: 'sameuser',
                email: 'sameuser@example.com'
            })
            mockDb.user.findFirst.mockResolvedValue(mockUser)

            const result = await userRepository.findByUsernameOrEmail(
                'sameuser',
                'sameuser@example.com'
            )

            expect(result).toEqual(mockUser)
        })

        it('should handle empty strings for both parameters', async () => {
            mockDb.user.findFirst.mockResolvedValue(null)

            const result = await userRepository.findByUsernameOrEmail('', '')

            expect(result).toBeNull()
            expect(mockDb.user.findFirst).toHaveBeenCalledWith({
                where: { OR: [{ username: '' }, { email: '' }] }
            })
        })

        it('should handle empty username with valid email', async () => {
            const mockUser = createMockUser({ email: 'test@example.com' })
            mockDb.user.findFirst.mockResolvedValue(mockUser)

            const result = await userRepository.findByUsernameOrEmail('', 'test@example.com')

            expect(result).toEqual(mockUser)
        })

        it('should handle valid username with empty email', async () => {
            const mockUser = createMockUser({ username: 'testuser' })
            mockDb.user.findFirst.mockResolvedValue(mockUser)

            const result = await userRepository.findByUsernameOrEmail('testuser', '')

            expect(result).toEqual(mockUser)
        })

        it('should return first match when multiple users could match', async () => {
            const mockUser = createMockUser({
                id: 'user-first',
                username: 'firstmatch'
            })
            mockDb.user.findFirst.mockResolvedValue(mockUser)

            const result = await userRepository.findByUsernameOrEmail(
                'firstmatch',
                'other@example.com'
            )

            expect(result).toEqual(mockUser)
        })
    })
})
