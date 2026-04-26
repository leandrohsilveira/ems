import { describe, it, expect } from 'vitest'
import { createAccountDtoSchema, createAccountResponseDtoSchema, createAccountDtoI18n } from './create-account.dto.js'
import { resolve } from '@ems/i18n'

describe('create-account.dto', () => {
    describe('createAccountDtoSchema', () => {
        it('should validate a valid create account input', () => {
            const result = createAccountDtoSchema.safeParse({
                name: 'Nubank Checking',
                initialBalance: 1000,
                currency: 'BRL'
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.name).toBe('Nubank Checking')
                expect(result.data.initialBalance).toBe(1000)
                expect(result.data.currency).toBe('BRL')
            }
        })

        it('should apply default values when optional fields are omitted', () => {
            const result = createAccountDtoSchema.safeParse({
                name: 'Nubank Checking'
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.initialBalance).toBe(0)
                expect(result.data.currency).toBe('BRL')
            }
        })

        it('should reject empty name', () => {
            const result = createAccountDtoSchema.safeParse({
                name: ''
            })
            expect(result.success).toBe(false)
        })

        it('should reject name exceeding 100 characters', () => {
            const result = createAccountDtoSchema.safeParse({
                name: 'x'.repeat(101)
            })
            expect(result.success).toBe(false)
        })

        it('should reject negative initial balance', () => {
            const result = createAccountDtoSchema.safeParse({
                name: 'Nubank Checking',
                initialBalance: -100
            })
            expect(result.success).toBe(false)
        })

        it('should coerce string initial balance to number', () => {
            const result = createAccountDtoSchema.safeParse({
                name: 'Nubank Checking',
                initialBalance: '1000'
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.initialBalance).toBe(1000)
            }
        })

        it('should reject negative string initial balance', () => {
            const result = createAccountDtoSchema.safeParse({
                name: 'Nubank Checking',
                initialBalance: '-100'
            })
            expect(result.success).toBe(false)
        })

        it('should reject invalid currency code', () => {
            const result = createAccountDtoSchema.safeParse({
                name: 'Nubank Checking',
                currency: 'INVALID'
            })
            expect(result.success).toBe(false)
        })
    })

    describe('createAccountResponseDtoSchema', () => {
        it('should validate a valid create account response', () => {
            const result = createAccountResponseDtoSchema.safeParse({
                account: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    userId: 'user-1',
                    name: 'Nubank Checking',
                    type: 'BANK',
                    currency: 'BRL',
                    balance: '1000.00',
                    createdAt: '2026-04-25T00:00:00Z',
                    updatedAt: '2026-04-25T00:00:00Z'
                }
            })
            expect(result.success).toBe(true)
        })

        it('should reject missing account wrapper', () => {
            const result = createAccountResponseDtoSchema.safeParse({})
            expect(result.success).toBe(false)
        })
    })

    describe('createAccountDtoI18n', () => {
        it('should resolve english literals by default', () => {
            const literals = resolve('en_US', createAccountDtoI18n)
            expect(literals['name.invalid']).toBe('Account name is required')
            expect(literals['initialBalance.invalid']).toBe('Initial balance must be a non-negative number')
        })

        it('should resolve portuguese literals', () => {
            const literals = resolve('pt_BR', createAccountDtoI18n)
            expect(literals['name.invalid']).toBe('O nome da conta é obrigatório')
            expect(literals['currency.invalid']).toBe('A moeda deve ser um código ISO 4217 válido')
        })
    })
})
