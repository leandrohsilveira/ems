import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUserRepository } from './user.repository.js'

describe('createUserRepository', () => {
    /** @type {import('@ems/types-backend-auth').UserRepository} */
    let userRepository
    /** @type {import('vitest').Mock} */
    let mockFindUnique

    beforeEach(() => {
        mockFindUnique = vi.fn()
        const mockDb = /** @type {import('@ems/database').PrismaClient} */ (
            /** @type {unknown} */ ({
                user: {
                    findUnique: mockFindUnique
                }
            })
        )
        userRepository = createUserRepository(mockDb)
    })

    describe('findByUsername', () => {
        it('should return user when found', async () => {
            const mockUser = {
                id: 'user-1',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashed',
                role: 'USER'
            }
            mockFindUnique.mockResolvedValue(mockUser)

            const result = await userRepository.findByUsername('testuser')

            expect(result).toEqual(mockUser)
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { username: 'testuser' }
            })
        })

        it('should return null when user not found', async () => {
            mockFindUnique.mockResolvedValue(null)

            const result = await userRepository.findByUsername('nonexistent')

            expect(result).toBeNull()
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { username: 'nonexistent' }
            })
        })
    })

    describe('findById', () => {
        it('should return user when found', async () => {
            const mockUser = {
                id: 'user-1',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashed',
                role: 'USER'
            }
            mockFindUnique.mockResolvedValue(mockUser)

            const result = await userRepository.findById('user-1')

            expect(result).toEqual(mockUser)
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: 'user-1' }
            })
        })

        it('should return null when user not found', async () => {
            mockFindUnique.mockResolvedValue(null)

            const result = await userRepository.findById('nonexistent-id')

            expect(result).toBeNull()
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: 'nonexistent-id' }
            })
        })
    })
})
