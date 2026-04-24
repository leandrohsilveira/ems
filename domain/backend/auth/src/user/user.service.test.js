import { describe, it, expect, beforeEach } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { error, ok, failure, ResultStatus } from '@ems/utils'
import { createUserService, UserServiceFailures } from './user.service.js'
import {
    createMockUser,
    createMockUserCreateDTO,
    createMockUserDTO,
    createMockSignUpRequestDTO
} from '../testing/user.js'

describe('createUserService', () => {
    /** @type {import('./user.service.js').UserService} */
    let userService
    /** @type {import('vitest-mock-extended').DeepMockProxy<import('./user.repository.js').UserRepository>} */
    let mockUserRepository
    /** @type {import('vitest-mock-extended').DeepMockProxy<import('../token/index.js').TokenService>} */
    let mockTokenService

    beforeEach(() => {
        mockUserRepository = mockDeep()
        mockTokenService = mockDeep()

        userService = createUserService(mockUserRepository, mockTokenService)
    })

    describe('createUser', () => {
        it('should create user successfully with hashed password', async () => {
            const userData = createMockUserCreateDTO()
            const mockUser = createMockUser()
            const expectedUserDTO = createMockUserDTO()

            mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))
            mockUserRepository.create.mockResolvedValue(ok(mockUser))

            const result = await userService.createUser(userData)

            expect(result.status).toBe(ResultStatus.OK)
            expect(result.data).toEqual(expectedUserDTO)
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

        it('should handle data conflict error from repository', async () => {
            const userData = createMockUserCreateDTO()

            mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))
            mockUserRepository.create.mockResolvedValue(failure(UserServiceFailures.CONFLICT))

            const result = await userService.createUser(userData)

            expect(result).toEqual(failure(UserServiceFailures.CONFLICT))
        })

        it('should return error result for repository errors', async () => {
            const userData = createMockUserCreateDTO()
            const repositoryError = new Error('Database connection failed')

            mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))
            mockUserRepository.create.mockRejectedValue(repositoryError)

            const result = await userService.createUser(userData)

            expect(result.status).toBe(ResultStatus.ERROR)
            expect(result.error).toBe(repositoryError)
        })

        it('should create user with null first and last names', async () => {
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

            mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))
            mockUserRepository.create.mockResolvedValue(ok(mockUser))

            const result = await userService.createUser(userData)

            expect(result.status).toBe(ResultStatus.OK)
            expect(result.data).toEqual(expectedUserDTO)
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
            /** @type {import('@ems/domain-shared-auth').Role[]} */
            const roles = ['USER', 'MANAGER', 'ADMIN']

            for (const role of roles) {
                const userData = createMockUserCreateDTO({ role })
                const mockUser = createMockUser({ role })
                const expectedUserDTO = createMockUserDTO({ role })

                mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))
                mockUserRepository.create.mockResolvedValue(ok(mockUser))

                const result = await userService.createUser(userData)

                expect(result.status).toBe(ResultStatus.OK)
                expect(result.data).toEqual(expectedUserDTO)
                expect(mockUserRepository.create).toHaveBeenCalledWith(
                    expect.objectContaining({ role })
                )

                mockTokenService.hashPassword.mockClear()
                mockUserRepository.create.mockClear()
            }
        })

        it('should exclude password from returned UserDTO', async () => {
            const userData = createMockUserCreateDTO()
            const mockUser = createMockUser()

            mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))
            mockUserRepository.create.mockResolvedValue(ok(mockUser))

            const result = await userService.createUser(userData)

            expect(result.status).toBe(ResultStatus.OK)
            expect(result.data).not.toHaveProperty('password')
            expect(result.data).toHaveProperty('userId')
            expect(result.data).toHaveProperty('username')
            expect(result.data).toHaveProperty('email')
            expect(result.data).toHaveProperty('role')
        })

        it('should return error when hashing fails', async () => {
            const userData = createMockUserCreateDTO()
            const hashError = new Error('Hashing failed')

            mockTokenService.hashPassword.mockResolvedValue(error(hashError))

            const result = await userService.createUser(userData)

            expect(result.status).toBe(ResultStatus.ERROR)
            expect(result.error).toBe(hashError)
            expect(mockUserRepository.create).not.toHaveBeenCalled()
        })
    })

    describe('findByUsernameOrEmail', () => {
        it('should return UserDTO when user found by username', async () => {
            const mockUser = createMockUser({ username: 'existinguser' })
            const expectedUserDTO = createMockUserDTO({ username: 'existinguser' })

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(ok(mockUser))

            const result = await userService.findByUsernameOrEmail(
                'existinguser',
                'new@example.com'
            )

            expect(result.status).toBe(ResultStatus.OK)
            expect(result.data).toEqual(expectedUserDTO)
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                'existinguser',
                'new@example.com'
            )
        })

        it('should return UserDTO when user found by email', async () => {
            const mockUser = createMockUser({ email: 'existing@example.com' })
            const expectedUserDTO = createMockUserDTO({ email: 'existing@example.com' })

            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(ok(mockUser))

            const result = await userService.findByUsernameOrEmail(
                'newuser',
                'existing@example.com'
            )

            expect(result.status).toBe(ResultStatus.OK)
            expect(result.data).toEqual(expectedUserDTO)
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                'newuser',
                'existing@example.com'
            )
        })

        it('should result in failure when user not found', async () => {
            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(
                failure(UserServiceFailures.NOT_FOUND)
            )

            const result = await userService.findByUsernameOrEmail('nonexistent', 'new@example.com')

            expect(result).toEqual(failure(UserServiceFailures.NOT_FOUND))
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                'nonexistent',
                'new@example.com'
            )
        })

        it('should return error result for repository errors', async () => {
            const repositoryError = new Error('Database error')
            mockUserRepository.findByUsernameOrEmail.mockRejectedValue(repositoryError)

            const result = await userService.findByUsernameOrEmail('test', 'test@example.com')

            expect(result.status).toBe(ResultStatus.ERROR)
            expect(result.error).toBe(repositoryError)
            expect(mockUserRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
                'test',
                'test@example.com'
            )
        })
    })

    describe('signup', () => {
        it('should sign up user successfully with valid data', async () => {
            const signupData = createMockSignUpRequestDTO()
            const mockUser = createMockUser()
            const expectedUserDTO = createMockUserDTO()

            mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))
            mockUserRepository.create.mockResolvedValue(ok(mockUser))

            const result = await userService.signup(signupData)

            expect(result.status).toBe(ResultStatus.OK)
            expect(result.data).toEqual(expectedUserDTO)
            expect(mockTokenService.hashPassword).toHaveBeenCalledWith(signupData.password)
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                firstName: signupData.firstName,
                lastName: signupData.lastName,
                email: signupData.email,
                username: signupData.username,
                password: 'hashed-password',
                role: 'USER'
            })
        })

        it('should handle data conflict error from repository', async () => {
            const signupData = createMockSignUpRequestDTO()

            mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))
            mockUserRepository.create.mockResolvedValue(failure(UserServiceFailures.CONFLICT))

            const result = await userService.signup(signupData)

            expect(result).toEqual(failure(UserServiceFailures.CONFLICT))
            expect(mockTokenService.hashPassword).toHaveBeenCalledWith(signupData.password)
            expect(mockUserRepository.create).toHaveBeenCalled()
        })

        it('should return error result for other database errors', async () => {
            const signupData = createMockSignUpRequestDTO()
            const databaseError = new Error('Database connection failed')

            mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))
            mockUserRepository.create.mockRejectedValue(databaseError)

            const result = await userService.signup(signupData)

            expect(result.status).toBe(ResultStatus.ERROR)
            expect(result.error).toBe(databaseError)
            expect(mockTokenService.hashPassword).toHaveBeenCalledWith(signupData.password)
            expect(mockUserRepository.create).toHaveBeenCalled()
        })

        it('should accept null firstName and lastName', async () => {
            const signupData = createMockSignUpRequestDTO({
                firstName: null,
                lastName: null
            })
            const mockUser = createMockUser({ firstName: null, lastName: null })
            const expectedUserDTO = createMockUserDTO({ firstName: null, lastName: null })

            mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))
            mockUserRepository.create.mockResolvedValue(ok(mockUser))

            const result = await userService.signup(signupData)

            expect(result.status).toBe(ResultStatus.OK)
            expect(result.data).toEqual(expectedUserDTO)
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
            const signupData = createMockSignUpRequestDTO()
            const mockUser = createMockUser({ role: 'USER' })

            mockTokenService.hashPassword.mockResolvedValue(ok('hashed-password'))
            mockUserRepository.create.mockResolvedValue(ok(mockUser))

            const result = await userService.signup(signupData)

            expect(result.status).toBe(ResultStatus.OK)
            expect(result.data?.role).toBe('USER')
            expect(mockUserRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'USER' })
            )
        })

        it('should return error when hashing fails', async () => {
            const signupData = createMockSignUpRequestDTO()
            const hashError = new Error('Hashing failed')

            mockTokenService.hashPassword.mockResolvedValue(error(hashError))

            const result = await userService.signup(signupData)

            expect(result.status).toBe(ResultStatus.ERROR)
            expect(result.error).toBe(hashError)
            expect(mockUserRepository.create).not.toHaveBeenCalled()
        })
    })
})
