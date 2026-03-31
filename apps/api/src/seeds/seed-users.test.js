import { describe, it, expect, beforeEach } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { seedUsers } from './seed-users.js'

describe('seedUsers', () => {
    /** @type {import('vitest-mock-extended').DeepMockProxy<import('@ems/types-backend-auth').UserService>} */
    let mockUserService

    beforeEach(() => {
        mockUserService = mockDeep()
    })

    it('should check for existing users before creating', async () => {
        // Arrange
        mockUserService.findByUsernameOrEmail.mockResolvedValue(null)

        // Act
        await seedUsers(mockUserService, 'testpassword')

        // Assert
        expect(mockUserService.findByUsernameOrEmail).toHaveBeenCalledTimes(3)
        expect(mockUserService.createUser).toHaveBeenCalledTimes(3)
    })

    it('should skip existing users', async () => {
        // Arrange
        mockUserService.findByUsernameOrEmail.mockResolvedValue({
            userId: '123',
            username: 'johndoe',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'USER'
        })

        // Act
        await seedUsers(mockUserService, 'testpassword')

        // Assert
        expect(mockUserService.createUser).not.toHaveBeenCalled()
    })

    it('should continue on individual user errors', async () => {
        // Arrange
        mockUserService.findByUsernameOrEmail
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null)

        mockUserService.createUser
            .mockRejectedValueOnce(new Error('Failed to create user'))
            .mockResolvedValueOnce({
                userId: 'user-2',
                username: 'janesmith',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                role: 'MANAGER'
            })
            .mockResolvedValueOnce({
                userId: 'user-3',
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                role: 'ADMIN'
            })

        // Act
        await expect(seedUsers(mockUserService, 'testpassword')).resolves.not.toThrow()

        // Assert
        expect(mockUserService.findByUsernameOrEmail).toHaveBeenCalledTimes(3)
        // Should still try to create the other users
        expect(mockUserService.createUser).toHaveBeenCalledTimes(3)
    })

    it('should pass correct password to createUser', async () => {
        // Arrange
        mockUserService.findByUsernameOrEmail.mockResolvedValue(null)

        // Act
        await seedUsers(mockUserService, 'securepassword123')

        // Assert
        expect(mockUserService.createUser).toHaveBeenCalledWith(
            expect.objectContaining({ password: 'securepassword123' })
        )
    })
})
