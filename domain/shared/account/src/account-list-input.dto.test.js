import { describe, it, expect } from 'vitest'
import { accountListInputDtoSchema } from './account-list-input.dto.js'

describe('account-list-input.dto', () => {
    describe('accountListInputDtoSchema', () => {
        it('should validate with default values', () => {
            const result = accountListInputDtoSchema.safeParse({})
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.size).toBe(10)
            }
        })

        it('should accept custom page size', () => {
            const result = accountListInputDtoSchema.safeParse({
                size: 20
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.size).toBe(20)
            }
        })

        it('should accept cursor for pagination', () => {
            const result = accountListInputDtoSchema.safeParse({
                size: 10,
                cursor: 'next-page-cursor'
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.cursor).toBe('next-page-cursor')
            }
        })

        it('should accept null cursor', () => {
            const result = accountListInputDtoSchema.safeParse({
                size: 10,
                cursor: null
            })
            expect(result.success).toBe(true)
        })

        it('should coerce string size to number', () => {
            const result = accountListInputDtoSchema.safeParse({
                size: '5'
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.size).toBe(5)
            }
        })
    })
})
