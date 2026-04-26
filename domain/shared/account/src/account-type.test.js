import { describe, it, expect } from 'vitest'
import { ACCOUNT_TYPE, getAllAccountTypes } from './account-type.js'

describe('account-type', () => {
    describe('ACCOUNT_TYPE', () => {
        it('should export account types as frozen object', () => {
            expect(ACCOUNT_TYPE).toBeDefined()
            expect(Object.isFrozen(ACCOUNT_TYPE)).toBe(true)
        })

        it('should have BANK account type', () => {
            expect(ACCOUNT_TYPE.BANK).toBe('BANK')
        })

        it('should have all values as strings', () => {
            Object.values(ACCOUNT_TYPE).forEach((type) => {
                expect(typeof type).toBe('string')
            })
        })
    })

    describe('getAllAccountTypes', () => {
        it('should return all account types', () => {
            const types = getAllAccountTypes()
            expect(types).toHaveLength(1)
            expect(types).toContain(ACCOUNT_TYPE.BANK)
        })

        it('should return frozen array', () => {
            const types = getAllAccountTypes()
            expect(Object.isFrozen(types)).toBe(true)
        })
    })
})
