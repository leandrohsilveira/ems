import { describe, it, expect, beforeEach } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { createUserService } from './user.service.js'
import {
    createMockUser,
    createMockUserCreateDTO,
    createMockUserDTO,
    createMockSignUpRequestDTO
} from '../testing/user.js'
import { Prisma } from '@ems/database'

describe('createUserService', () => {
    /** @type {import('@ems/types-backend-auth').UserService} */
    let userService
    /** @type {import('vitest-mock-extended').DeepMockProxy<import('@ems/types-backend-auth').UserRepository>} */
    let mockUserRepository
    /** @type {import('vitest-mock-extended').DeepMockProxy<import('@ems/types-backend-auth').TokenService>} */
    let mockTokenService

    beforeEach(() => {
        mockUserRepository = mockDeep()
        mockTokenService = mockDeep()

        userService = createUserService(mockUserRepository, mockTokenService)
    })

    describe('createUser', () => {
        it('should create user successfully with hashed password', async () => {
            // Arrange
            const userData = createMockUserCreateDTO()
            const mockUser = createMockUser()
            const expectedUserDTO = createMockUserDTO()

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockResolvedValue(mockUser)

            // Act
            const result = await userService.createUser(userData)

            // Assert
            expect(result).toEqual(expectedUserDTO)
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                userData.username,
                userData.email
            )
            expect(mockTokenService.hashPassword).toHaveBeenCalledWith(userData.password)
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                username: userData.username,
                password: 'hashed-password',
                role: userData.role
            })
        })

        it('should throw error when user with username already exists', async () => {
            // Arrange
            const userData = createMockUserCreateDTO()
            const existingUser = createMockUser({ username: userData.username })

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(existingUser)

            // Act & Assert
            await expect(userService.createUser(userData)).rejects.toThrow(
                'User with this username or email already exists'
            )
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                userData.username,
                userData.email
            )
            expect(mockTokenService.hashPassword).not.toHaveBeenCalled()
            expect(mockUserRepository.create).not.toHaveBeenCalled()
        })

        it('should throw error when user with email already exists', async () => {
            // Arrange
            const userData = createMockUserCreateDTO()
            const existingUser = createMockUser({ email: userData.email })

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(existingUser)

            // Act & Assert
            await expect(userService.createUser(userData)).rejects.toThrow(
                'User with this username or email already exists'
            )
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                userData.username,
                userData.email
            )
            expect(mockTokenService.hashPassword).not.toHaveBeenCalled()
            expect(mockUserRepository.create).not.toHaveBeenCalled()
        })

        it('should handle Prisma unique constraint error for username', async () => {
            // Arrange
            const userData = createMockUserCreateDTO()
            const constraintError = new Prisma.PrismaClientKnownRequestError(
                'Unique constraint failed on the fields: (`username`)',
                { code: 'P2002', clientVersion: '7.5.0' }
            )

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockRejectedValue(constraintError)

            // Act & Assert
            await expect(userService.createUser(userData)).rejects.toThrow(
                'User with this username or email already exists'
            )
        })

        it('should handle Prisma unique constraint error for email', async () => {
            // Arrange
            const userData = createMockUserCreateDTO()
            const constraintError = new Prisma.PrismaClientKnownRequestError(
                'Unique constraint failed on the fields: (`email`)',
                { code: 'P2002', clientVersion: '7.5.0' }
            )

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockRejectedValue(constraintError)

            // Act & Assert
            await expect(userService.createUser(userData)).rejects.toThrow(
                'User with this username or email already exists'
            )
        })

        it('should re-throw other repository errors', async () => {
            // Arrange
            const userData = createMockUserCreateDTO()
            const repositoryError = new Error('Database connection failed')

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockRejectedValue(repositoryError)

            // Act & Assert
            await expect(userService.createUser(userData)).rejects.toThrow(repositoryError)
        })

        it('should create user with null first and last names', async () => {
            // Arrange
            const userData = createMockUserCreateDTO({
                firstName: null,
                lastName: null
            })
            const mockUser = createMockUser({
                firstName: null,
                lastName: null
            })
            const expectedUserDTO = createMockUserDTO({
                firstName: null,
                lastName: null
            })

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockResolvedValue(mockUser)

            // Act
            const result = await userService.createUser(userData)

            // Assert
            expect(result).toEqual(expectedUserDTO)
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                firstName: null,
                lastName: null,
                email: userData.email,
                username: userData.username,
                password: 'hashed-password',
                role: userData.role
            })
        })

        it('should create user with different roles', async () => {
            // Test all roles: USER, MANAGER, ADMIN
            const roles = ['USER', 'MANAGER', 'ADMIN']

            for (const role of roles) {
                // Arrange
                const userData = createMockUserCreateDTO({
                    role: /** @type {'USER' | 'MANAGER' | 'ADMIN'} */ (role)
                })
                const mockUser = createMockUser({
                    role: /** @type {import('@ems/database').Role} */ (role)
                })
                const expectedUserDTO = createMockUserDTO({ role })

                mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
                mockTokenService.hashPassword.mockResolvedValue('hashed-password')
                mockUserRepository.create.mockResolvedValue(mockUser)

                // Act
                const result = await userService.createUser(userData)

                // Assert
                expect(result).toEqual(expectedUserDTO)
                expect(mockUserRepository.create).toHaveBeenCalledWith(
                    expect.objectContaining({ role })
                )

                // Reset mocks for next iteration
                mockUserRepository.findByUsernameOrEmail.mockClear()
                mockTokenService.hashPassword.mockClear()
                mockUserRepository.create.mockClear()
            }
        })

        it('should exclude password from returned UserDTO', async () => {
            // Arrange
            const userData = createMockUserCreateDTO()
            const mockUser = createMockUser()

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockResolvedValue(mockUser)

            // Act
            const result = await userService.createUser(userData)

            // Assert
            expect(result).not.toHaveProperty('password')
            expect(result).toHaveProperty('userId')
            expect(result).toHaveProperty('username')
            expect(result).toHaveProperty('email')
            expect(result).toHaveProperty('role')
        })
    })

    describe('findByUsernameOrEmail', () => {
        it('should return UserDTO when user found by username', async () => {
            // Arrange
            const mockUser = createMockUser({ username: 'existinguser' })
            const expectedUserDTO = createMockUserDTO({ username: 'existinguser' })

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(mockUser)

            // Act
            const result = await userService.findByUsernameOrEmail(
                'existinguser',
                'new@example.com'
            )

            // Assert
            expect(result).toEqual(expectedUserDTO)
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                'existinguser',
                'new@example.com'
            )
        })

        it('should return UserDTO when user found by email', async () => {
            // Arrange
            const mockUser = createMockUser({ email: 'existing@example.com' })
            const expectedUserDTO = createMockUserDTO({ email: 'existing@example.com' })

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(mockUser)

            // Act
            const result = await userService.findByUsernameOrEmail(
                'newuser',
                'existing@example.com'
            )

            // Assert
            expect(result).toEqual(expectedUserDTO)
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                'newuser',
                'existing@example.com'
            )
        })

        it('should return null when user not found', async () => {
            // Arrange
            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)

            // Act
            const result = await userService.findByUsernameOrEmail('nonexistent', 'new@example.com')

            // Assert
            expect(result).toBeNull()
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                'nonexistent',
                'new@example.com'
            )
        })

        it('should propagate repository errors', async () => {
            // Arrange
            const repositoryError = new Error('Database error')
            mockUserRepository.findByUsernameOrEmail.mockRejectedValue(repositoryError)

            // Act & Assert
            await expect(
                userService.findByUsernameOrEmail('test', 'test@example.com')
            ).rejects.toThrow('Database error')
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                'test',
                'test@example.com'
            )
        })
    })

    describe('signup', () => {
        it('should sign up user successfully with valid data', async () => {
            // Arrange
            const signupData = createMockSignUpRequestDTO()
            const mockUser = createMockUser()
            const expectedUserDTO = createMockUserDTO()

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockResolvedValue(mockUser)

            // Act
            const result = await userService.signup(signupData)

            // Assert
            expect(result).toEqual(expectedUserDTO)
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                signupData.username,
                signupData.email
            )
            expect(mockTokenService.hashPassword).toHaveBeenCalledWith(signupData.password)
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                firstName: signupData.firstName,
                lastName: signupData.lastName,
                email: signupData.email,
                username: signupData.username,
                password: 'hashed-password',
                role: 'USER' // Default role for signup
            })
        })

        it('should throw error when user with username already exists', async () => {
            // Arrange
            const signupData = createMockSignUpRequestDTO()
            const existingUser = createMockUser({ username: signupData.username })

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(existingUser)

            // Act & Assert
            await expect(userService.signup(signupData)).rejects.toThrow(
                'User with this username or email already exists'
            )
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                signupData.username,
                signupData.email
            )
            expect(mockTokenService.hashPassword).not.toHaveBeenCalled()
            expect(mockUserRepository.create).not.toHaveBeenCalled()
        })

        it('should throw error when user with email already exists', async () => {
            // Arrange
            const signupData = createMockSignUpRequestDTO()
            const existingUser = createMockUser({ email: signupData.email })

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(existingUser)

            // Act & Assert
            await expect(userService.signup(signupData)).rejects.toThrow(
                'User with this username or email already exists'
            )
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                signupData.username,
                signupData.email
            )
            expect(mockTokenService.hashPassword).not.toHaveBeenCalled()
            expect(mockUserRepository.create).not.toHaveBeenCalled()
        })

        it('should handle Prisma unique constraint error for username', async () => {
            // Arrange
            const signupData = createMockSignUpRequestDTO()
            const constraintError = new Prisma.PrismaClientKnownRequestError(
                'Unique constraint failed on the fields: (`username`)',
                { code: 'P2002', clientVersion: '7.5.0' }
            )

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockRejectedValue(constraintError)

            // Act & Assert
            await expect(userService.signup(signupData)).rejects.toThrow(
                'User with this username or email already exists'
            )
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                signupData.username,
                signupData.email
            )
            expect(mockTokenService.hashPassword).toHaveBeenCalledWith(signupData.password)
            expect(mockUserRepository.create).toHaveBeenCalled()
        })

        it('should handle Prisma unique constraint error for email', async () => {
            // Arrange
            const signupData = createMockSignUpRequestDTO()
            const constraintError = new Prisma.PrismaClientKnownRequestError(
                'Unique constraint failed on the fields: (`email`)',
                { code: 'P2002', clientVersion: '7.5.0' }
            )

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockRejectedValue(constraintError)

            // Act & Assert
            await expect(userService.signup(signupData)).rejects.toThrow(
                'User with this username or email already exists'
            )
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                signupData.username,
                signupData.email
            )
            expect(mockTokenService.hashPassword).toHaveBeenCalledWith(signupData.password)
            expect(mockUserRepository.create).toHaveBeenCalled()
        })

        it('should handle other database errors', async () => {
            // Arrange
            const signupData = createMockSignUpRequestDTO()
            const databaseError = new Error('Database connection failed')

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockRejectedValue(databaseError)

            // Act & Assert
            await expect(userService.signup(signupData)).rejects.toThrow(
                'Database connection failed'
            )
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                signupData.username,
                signupData.email
            )
            expect(mockTokenService.hashPassword).toHaveBeenCalledWith(signupData.password)
            expect(mockUserRepository.create).toHaveBeenCalled()
        })

        it('should accept null firstName and lastName', async () => {
            // Arrange
            const signupData = createMockSignUpRequestDTO({
                firstName: null,
                lastName: null
            })
            const mockUser = createMockUser({ firstName: null, lastName: null })
            const expectedUserDTO = createMockUserDTO({ firstName: null, lastName: null })

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockResolvedValue(mockUser)

            // Act
            const result = await userService.signup(signupData)

            // Assert
            expect(result).toEqual(expectedUserDTO)
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                firstName: null,
                lastName: null,
                email: signupData.email,
                username: signupData.username,
                password: 'hashed-password',
                role: 'USER'
            })
        })

        it('should always set role to USER for signup', async () => {
            // Arrange
            const signupData = createMockSignUpRequestDTO()
            const mockUser = createMockUser({ role: 'USER' }) // Should always be USER

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null)
            mockTokenService.hashPassword.mockResolvedValue('hashed-password')
            mockUserRepository.create.mockResolvedValue(mockUser)

            // Act
            const result = await userService.signup(signupData)

            // Assert
            expect(result.role).toBe('USER')
            expect(mockUserRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'USER' })
            )
        })
    })
})
