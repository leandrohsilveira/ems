import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSessionRepository } from './session.repository'

describe('createSessionRepository', () => {
    /** @type {ReturnType<typeof createSessionRepository>} */
    let sessionRepository
    /** @type {import('vitest').Mock} */
    let mockFindUnique
    /** @type {import('vitest').Mock} */
    let mockFindMany
    /** @type {import('vitest').Mock} */
    let mockCreate
    /** @type {import('vitest').Mock} */
    let mockUpdate
    /** @type {import('vitest').Mock} */
    let mockDelete
    /** @type {import('vitest').Mock} */
    let mockDeleteMany

    beforeEach(() => {
        mockFindUnique = vi.fn()
        mockFindMany = vi.fn()
        mockCreate = vi.fn()
        mockUpdate = vi.fn()
        mockDelete = vi.fn()
        mockDeleteMany = vi.fn()

        const mockDb = /** @type {import('@ems/database').PrismaClient} */ (
            /** @type {unknown} */ ({
                session: {
                    findUnique: mockFindUnique,
                    findMany: mockFindMany,
                    create: mockCreate,
                    update: mockUpdate,
                    delete: mockDelete,
                    deleteMany: mockDeleteMany
                }
            })
        )
        sessionRepository = createSessionRepository(mockDb)
    })

    describe('findByJti', () => {
        it('should return session with user when found', async () => {
            const mockSession = { id: 'sess-1', userId: 'user-1', jti: 'token-123', user: {} }
            mockFindUnique.mockResolvedValue(mockSession)

            const result = await sessionRepository.findByJti('token-123')

            expect(result).toEqual(mockSession)
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { jti: 'token-123' },
                include: { user: true }
            })
        })

        it('should return null when session not found', async () => {
            mockFindUnique.mockResolvedValue(null)

            const result = await sessionRepository.findByJti('nonexistent')

            expect(result).toBeNull()
        })
    })

    describe('findByUserId', () => {
        it('should return sessions with user for user', async () => {
            const mockSessions = [
                { id: 'sess-1', userId: 'user-1', user: {} },
                { id: 'sess-2', userId: 'user-1', user: {} }
            ]
            mockFindMany.mockResolvedValue(mockSessions)

            const result = await sessionRepository.findByUserId('user-1')

            expect(result).toEqual(mockSessions)
            expect(mockFindMany).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                include: { user: true }
            })
        })
    })

    describe('create', () => {
        it('should create and return session', async () => {
            const input = {
                userId: 'user-1',
                jti: 'token-123',
                lastRefresh: new Date(),
                expiresAt: new Date()
            }
            const mockSession = { id: 'sess-1', ...input }
            mockCreate.mockResolvedValue(mockSession)

            const result = await sessionRepository.create(input)

            expect(result).toEqual(mockSession)
            expect(mockCreate).toHaveBeenCalledWith({ data: input })
        })
    })

    describe('update', () => {
        it('should update and return session', async () => {
            const input = { jti: 'new-token', lastRefresh: new Date() }
            const mockSession = { id: 'sess-1', ...input }
            mockUpdate.mockResolvedValue(mockSession)

            const result = await sessionRepository.update('sess-1', input)

            expect(result).toEqual(mockSession)
            expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 'sess-1' }, data: input })
        })
    })

    describe('delete', () => {
        it('should delete session by id', async () => {
            mockDelete.mockResolvedValue({})

            await sessionRepository.delete('sess-1')

            expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'sess-1' } })
        })
    })

    describe('deleteByJti', () => {
        it('should delete session by jti', async () => {
            mockDeleteMany.mockResolvedValue({ count: 1 })

            await sessionRepository.deleteByJti('token-123')

            expect(mockDeleteMany).toHaveBeenCalledWith({ where: { jti: 'token-123' } })
        })
    })

    describe('deleteAllByUserId', () => {
        it('should delete all sessions for user', async () => {
            mockDeleteMany.mockResolvedValue({ count: 3 })

            await sessionRepository.deleteAllByUserId('user-1')

            expect(mockDeleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } })
        })
    })
})
