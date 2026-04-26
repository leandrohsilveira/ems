import { describe, it, expect } from 'vitest'
import { accountListDtoSchema } from './account-list.dto.js'

describe('account-list.dto', () => {
    describe('accountListDtoSchema', () => {
        it('should validate a valid paginated account list', () => {
            const result = accountListDtoSchema.safeParse({
                items: [
                    {
                        id: '550e8400-e29b-41d4-a716-446655440000',
                        userId: 'user-1',
                        name: 'Nubank Checking',
                        type: 'BANK',
                        currency: 'BRL',
                        balance: '1000.00',
                        createdAt: '2026-04-25T00:00:00Z',
                        updatedAt: '2026-04-25T00:00:00Z'
                    }
                ],
                size: 10,
                nextPageCursor: null
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.items).toHaveLength(1)
                expect(result.data.size).toBe(10)
                expect(result.data.nextPageCursor).toBeNull()
            }
        })

        it('should validate empty items array', () => {
            const result = accountListDtoSchema.safeParse({
                items: [],
                size: 0,
                nextPageCursor: null
            })
            expect(result.success).toBe(true)
        })

        it('should validate with a next page cursor', () => {
            const result = accountListDtoSchema.safeParse({
                items: [
                    {
                        id: '550e8400-e29b-41d4-a716-446655440000',
                        userId: 'user-1',
                        name: 'Nubank Checking',
                        type: 'BANK',
                        currency: 'BRL',
                        balance: '1000.00',
                        createdAt: '2026-04-25T00:00:00Z',
                        updatedAt: '2026-04-25T00:00:00Z'
                    }
                ],
                size: 10,
                nextPageCursor: 'cursor-123'
            })
            expect(result.success).toBe(true)
        })

        it('should reject missing required fields', () => {
            const result = accountListDtoSchema.safeParse({})
            expect(result.success).toBe(false)
        })

        it('should reject invalid account items', () => {
            const result = accountListDtoSchema.safeParse({
                items: [{ invalid: true }],
                size: 1,
                nextPageCursor: null
            })
            expect(result.success).toBe(false)
        })
    })
})
