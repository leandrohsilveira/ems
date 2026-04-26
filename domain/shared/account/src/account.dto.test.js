import { describe, it, expect } from 'vitest'
import { accountDtoSchema } from './account.dto.js'

describe('account.dto', () => {
    describe('accountDtoSchema', () => {
        it('should validate a valid account object', () => {
            const result = accountDtoSchema.safeParse({
                id: '550e8400-e29b-41d4-a716-446655440000',
                userId: 'user-1',
                name: 'Nubank Checking',
                type: 'BANK',
                currency: 'BRL',
                balance: '1000.00',
                createdAt: '2026-04-25T00:00:00Z',
                updatedAt: '2026-04-25T00:00:00Z'
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.name).toBe('Nubank Checking')
                expect(result.data.type).toBe('BANK')
                expect(result.data.balance).toBe('1000.00')
            }
        })

        it('should reject missing required fields', () => {
            const result = accountDtoSchema.safeParse({})
            expect(result.success).toBe(false)
        })

        it('should reject invalid account type', () => {
            const result = accountDtoSchema.safeParse({
                id: '550e8400-e29b-41d4-a716-446655440000',
                userId: 'user-1',
                name: 'Nubank Checking',
                type: 'CREDIT_CARD',
                currency: 'BRL',
                balance: '1000.00',
                createdAt: '2026-04-25T00:00:00Z',
                updatedAt: '2026-04-25T00:00:00Z'
            })
            expect(result.success).toBe(false)
        })
    })
})
