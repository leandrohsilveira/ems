import { describe, it, expect } from 'vitest'
import { createEnum } from './enum.js'

describe('createEnum', () => {
    it('returns an object with the same keys and values as the input', () => {
        const status = createEnum({ ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' })
        expect(status.ACTIVE).toBe('ACTIVE')
        expect(status.INACTIVE).toBe('INACTIVE')
    })

    it('provides a values() method that returns the keys', () => {
        const status = createEnum({ ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' })
        expect(status.values()).toEqual(['ACTIVE', 'INACTIVE'])
    })

    it('values() returns an empty array for an empty enum', () => {
        const empty = createEnum({})
        expect(empty.values()).toEqual([])
    })

    it('values() returns the same array instance each call', () => {
        const status = createEnum({ A: 'A', B: 'B' })
        expect(status.values()).toBe(status.values())
    })

    it('does not mutate the original object', () => {
        const original = /** @type {const} */ ({ A: 'A', B: 'B' })
        const status = createEnum(original)
        status.values()
        expect(original).toEqual({ A: 'A', B: 'B' })
    })

    it('does not add values() as an enum key', () => {
        const status = createEnum({ A: 'A' })
        expect(status.values()).not.toContain('values')
    })

    it('spreads correctly with Object.keys', () => {
        const status = createEnum({ A: 'A', B: 'B' })
        expect(Object.keys(status)).toEqual(['A', 'B', 'values'])
    })

    it('is frozen and cannot be mutated', () => {
        const status = createEnum({ A: 'A' })
        expect(Object.isFrozen(status)).toBe(true)
        expect(status.A).toBe('A')
    })
})
