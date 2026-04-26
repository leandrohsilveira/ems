import { describe, it, expect } from 'vitest'
import { updateAccountDtoSchema, updateAccountResponseDtoSchema, updateAccountDtoI18n } from './update-account.dto.js'
import { resolve } from '@ems/i18n'

describe('update-account.dto', () => {
    describe('updateAccountDtoSchema', () => {
        it('should validate a valid update account input', () => {
            const result = updateAccountDtoSchema.safeParse({
                name: 'Nubank Joint Checking'
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.name).toBe('Nubank Joint Checking')
            }
        })

        it('should reject empty name', () => {
            const result = updateAccountDtoSchema.safeParse({
                name: ''
            })
            expect(result.success).toBe(false)
        })

        it('should reject name exceeding 100 characters', () => {
            const result = updateAccountDtoSchema.safeParse({
                name: 'x'.repeat(101)
            })
            expect(result.success).toBe(false)
        })

        it('should reject missing name field', () => {
            const result = updateAccountDtoSchema.safeParse({})
            expect(result.success).toBe(false)
        })
    })

    describe('updateAccountResponseDtoSchema', () => {
        it('should validate a valid update account response', () => {
            const result = updateAccountResponseDtoSchema.safeParse({
                account: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    userId: 'user-1',
                    name: 'Nubank Joint Checking',
                    type: 'BANK',
                    currency: 'BRL',
                    balance: '1000.00',
                    createdAt: '2026-04-25T00:00:00Z',
                    updatedAt: '2026-04-26T00:00:00Z'
                }
            })
            expect(result.success).toBe(true)
        })

        it('should reject missing account wrapper', () => {
            const result = updateAccountResponseDtoSchema.safeParse({})
            expect(result.success).toBe(false)
        })
    })

    describe('updateAccountDtoI18n', () => {
        it('should resolve english literals by default', () => {
            const literals = resolve('en_US', updateAccountDtoI18n)
            expect(literals['name.invalid']).toBe('Account name is required')
            expect(literals['name.max']).toBe('Account name cannot exceed {maximum} characters')
        })

        it('should resolve portuguese literals', () => {
            const literals = resolve('pt_BR', updateAccountDtoI18n)
            expect(literals['name.invalid']).toBe('O nome da conta é obrigatório')
        })
    })
})
