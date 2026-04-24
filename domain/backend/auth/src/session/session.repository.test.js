import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Prisma } from '@ems/database'
import { failure, ok } from '@ems/utils'
import { createSessionRepository, SessionRepositoryFailuresEnum } from './session.repository.js'

describe('createSessionRepository', () => {
    /** @type {import('./session.repository.js').SessionRepository} */
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
        it('should return ok with session when found', async () => {
            const mockSession = { id: 'sess-1', userId: 'user-1', jti: 'token-123', user: {} }
            mockFindUnique.mockResolvedValue(mockSession)

            const result = await sessionRepository.findByJti('token-123')

            expect(result).toEqual(ok(mockSession))
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { jti: 'token-123' },
                include: { user: true }
            })
        })

        it('should return failure NOT_FOUND when session not found', async () => {
            mockFindUnique.mockResolvedValue(null)

            const result = await sessionRepository.findByJti('nonexistent')

            expect(result).toEqual(failure(SessionRepositoryFailuresEnum.NOT_FOUND))
        })
    })

    describe('findByUserId', () => {
        it('should return ok with sessions when found', async () => {
            const mockSessions = [
                { id: 'sess-1', userId: 'user-1', user: {} },
                { id: 'sess-2', userId: 'user-1', user: {} }
            ]
            mockFindMany.mockResolvedValue(mockSessions)

            const result = await sessionRepository.findByUserId('user-1')

            expect(result).toEqual(ok(mockSessions))
            expect(mockFindMany).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                include: { user: true }
            })
        })

        it('should return ok with empty array when no sessions found', async () => {
            mockFindMany.mockResolvedValue([])

            const result = await sessionRepository.findByUserId('user-1')

            expect(result).toEqual(ok([]))
        })
    })

    describe('create', () => {
        it('should return ok with created session', async () => {
            const input = {
                userId: 'user-1',
                jti: 'token-123',
                lastRefresh: new Date(),
                expiresAt: new Date()
            }
            const mockSession = { id: 'sess-1', ...input }
            mockCreate.mockResolvedValue(mockSession)

            const result = await sessionRepository.create(input)

            expect(result).toEqual(ok(mockSession))
            expect(mockCreate).toHaveBeenCalledWith({ data: input })
        })

        it('should return failure CONFLICT on unique constraint violation', async () => {
            const input = {
                userId: 'user-1',
                jti: 'token-123',
                lastRefresh: new Date(),
                expiresAt: new Date()
            }
            const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
                code: 'P2002',
                clientVersion: '5.0.0'
            })
            mockCreate.mockRejectedValue(prismaError)

            const result = await sessionRepository.create(input)

            expect(result).toEqual(failure(SessionRepositoryFailuresEnum.CONFLICT))
        })
    })

    describe('update', () => {
        it('should return ok with updated session', async () => {
            const input = { jti: 'new-token', lastRefresh: new Date() }
            const mockSession = { id: 'sess-1', ...input }
            mockUpdate.mockResolvedValue(mockSession)

            const result = await sessionRepository.update('sess-1', input)

            expect(result).toEqual(ok(mockSession))
            expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 'sess-1' }, data: input })
        })

        it('should return error when record does not exist', async () => {
            const input = { jti: 'new-token', lastRefresh: new Date() }
            const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
                code: 'P2025',
                clientVersion: '5.0.0'
            })
            mockUpdate.mockRejectedValue(prismaError)

            const result = await sessionRepository.update('nonexistent', input)

            expect(result.status).toBe('ERROR')
            expect(result.error).toBeInstanceOf(Error)
        })
    })

    describe('delete', () => {
        it('should return ok with null on successful delete', async () => {
            mockDelete.mockResolvedValue({})

            const result = await sessionRepository.delete('sess-1')

            expect(result).toEqual(ok(null))
            expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'sess-1' } })
        })

        it('should return failure NOT_FOUND when record does not exist', async () => {
            const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
                code: 'P2025',
                clientVersion: '5.0.0'
            })
            mockDelete.mockRejectedValue(prismaError)

            const result = await sessionRepository.delete('nonexistent')

            expect(result).toEqual(failure(SessionRepositoryFailuresEnum.NOT_FOUND))
        })
    })

    describe('deleteByJti', () => {
        it('should return ok with null on successful delete', async () => {
            mockDelete.mockResolvedValue({})

            const result = await sessionRepository.deleteByJti('token-123')

            expect(result).toEqual(ok(null))
            expect(mockDelete).toHaveBeenCalledWith({ where: { jti: 'token-123' } })
        })
    })

    describe('deleteAllByUserId', () => {
        it('should return ok with null on successful delete', async () => {
            mockDeleteMany.mockResolvedValue({ count: 3 })

            const result = await sessionRepository.deleteAllByUserId('user-1')

            expect(result).toEqual(ok(null))
            expect(mockDeleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } })
        })
    })
})
