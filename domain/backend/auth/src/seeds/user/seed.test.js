import { describe, it, expect, beforeEach } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { seedUsers } from './seed.js'
import { ok, failure, error, ResultStatus } from '@ems/utils'
import { UserServiceFailures } from '../../user/index.js'

describe('seedUsers', () => {
    /** @type {import('vitest-mock-extended').DeepMockProxy<import('../../user/index.js').UserService>} */
    let mockUserService

    beforeEach(() => {
        mockUserService = mockDeep()
    })

    it('should check for existing users before creating', async () => {
        // Arrange
        mockUserService.findByUsernameOrEmail.mockResolvedValue(
            failure(UserServiceFailures.NOT_FOUND)
        )
        mockUserService.createUser.mockResolvedValue(
            ok({
                userId: 'user-1',
                username: 'johndoe',
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'USER'
            })
        )

        // Act
        const { status } = await seedUsers(mockUserService, 'testpassword')

        // Assert
        expect(status).toBe(ResultStatus.OK)
        expect(mockUserService.findByUsernameOrEmail).toHaveBeenCalledTimes(3)
        expect(mockUserService.createUser).toHaveBeenCalledTimes(3)
    })

    it('should skip existing users', async () => {
        // Arrange
        mockUserService.findByUsernameOrEmail.mockResolvedValue(
            ok({
                userId: '123',
                username: 'johndoe',
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'USER'
            })
        )

        // Act
        const { status } = await seedUsers(mockUserService, 'testpassword')

        // Assert
        expect(status).toBe(ResultStatus.OK)
        expect(mockUserService.createUser).not.toHaveBeenCalled()
    })

    it('should continue on individual user errors', async () => {
        // Arrange
        mockUserService.findByUsernameOrEmail.mockResolvedValue(
            failure(UserServiceFailures.NOT_FOUND)
        )

        mockUserService.createUser
            .mockResolvedValueOnce(error(new Error('Database connection failed')))
            .mockResolvedValueOnce(
                ok({
                    userId: 'user-2',
                    username: 'janesmith',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane.smith@example.com',
                    role: 'MANAGER'
                })
            )
            .mockResolvedValueOnce(
                ok({
                    userId: 'user-3',
                    username: 'admin',
                    firstName: 'Admin',
                    lastName: 'User',
                    email: 'admin@example.com',
                    role: 'ADMIN'
                })
            )

        // Act
        const { status } = await seedUsers(mockUserService, 'testpassword')

        // Assert
        expect(status).toBe(ResultStatus.OK)
        expect(mockUserService.findByUsernameOrEmail).toHaveBeenCalledTimes(3)
        expect(mockUserService.createUser).toHaveBeenCalledTimes(3)
    })

    it('should pass correct password to createUser', async () => {
        // Arrange
        mockUserService.findByUsernameOrEmail.mockResolvedValue(
            failure(UserServiceFailures.NOT_FOUND)
        )
        mockUserService.createUser.mockResolvedValue(
            ok({
                userId: 'user-1',
                username: 'johndoe',
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'USER'
            })
        )

        // Act
        const { status } = await seedUsers(mockUserService, 'securepassword123')

        // Assert
        expect(status).toBe(ResultStatus.OK)
        expect(mockUserService.createUser).toHaveBeenCalledWith(
            expect.objectContaining({ password: 'securepassword123' })
        )
    })
})
