import { describe, it, expect } from 'vitest'
import { AccountType } from './account-type.js'

describe('account-type', () => {
    describe('AccountType', () => {
        it('should export account types as enum', () => {
            expect(AccountType).toBeDefined()
        })

        it('should have BANK account type', () => {
            expect(AccountType.BANK).toBe('BANK')
        })

        it('should have all values as strings', () => {
            AccountType.values().forEach((type) => {
                expect(typeof type).toBe('string')
            })
        })

        it('should return values via values()', () => {
            const types = AccountType.values()
            expect(types).toHaveLength(1)
            expect(types).toContain(AccountType.BANK)
        })
    })
})
