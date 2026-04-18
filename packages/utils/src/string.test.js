import { describe, it, expect } from 'vitest'
import { formatMessage } from './string.js'

describe('formatMessage', () => {
    describe('basic functionality', () => {
        it('replaces single parameter with value', () => {
            expect(formatMessage('Hello {name}', { name: 'John' })).toBe('Hello John')
        })

        it('replaces multiple parameters with values', () => {
            expect(
                formatMessage('Hello {name}, welcome to {app}!', { name: 'John', app: 'MyApp' })
            ).toBe('Hello John, welcome to MyApp!')
        })

        it('handles parameters with whitespace in curly braces', () => {
            expect(formatMessage('Value: { value }', { value: 42 })).toBe('Value: 42')
        })

        it('replaces same parameter multiple times', () => {
            expect(formatMessage('{x} + {x} = {result}', { x: 2, result: 4 })).toBe('2 + 2 = 4')
        })
    })

    describe('edge cases', () => {
        it('returns empty string for empty template', () => {
            expect(formatMessage('', {})).toBe('')
        })

        it('returns template unchanged when no parameters match', () => {
            expect(formatMessage('Hello {name}', { other: 'value' })).toBe('Hello {name}')
        })

        it('handles empty params object', () => {
            expect(formatMessage('Hello {name}', {})).toBe('Hello {name}')
        })

        it('handles null and undefined parameter values', () => {
            expect(formatMessage('Value: {x}', { x: null })).toBe('Value: ')
            expect(formatMessage('Value: {x}', { x: undefined })).toBe('Value: ')
        })

        it('converts non-string parameter values to strings', () => {
            expect(formatMessage('Number: {num}', { num: 42 })).toBe('Number: 42')
            expect(formatMessage('Boolean: {bool}', { bool: true })).toBe('Boolean: true')
            expect(formatMessage('Object: {obj}', { obj: { a: 1 } })).toBe(
                'Object: [object Object]'
            )
        })
    })

    describe('parameter handling', () => {
        it('handles parameter names with special characters', () => {
            expect(formatMessage('Value: {param-name}', { 'param-name': 'test' })).toBe(
                'Value: test'
            )
            expect(formatMessage('Value: {param_name}', { param_name: 'test' })).toBe('Value: test')
            expect(formatMessage('Value: {param.name}', { 'param.name': 'test' })).toBe(
                'Value: test'
            )
        })

        it('handles nested curly braces in template', () => {
            expect(formatMessage('{{not a param}} {param}', { param: 'value' })).toBe(
                '{{not a param}} value'
            )
        })

        it('handles empty curly braces', () => {
            expect(formatMessage('{} {param}', { param: 'value' })).toBe('{} value')
        })

        it('handles malformed curly braces', () => {
            expect(formatMessage('{param {param}', { param: 'value' })).toBe('{param value')
            expect(formatMessage('param} {param}', { param: 'value' })).toBe('param} value')
        })

        it('trims whitespace from parameter names', () => {
            expect(formatMessage('Value: {  param  }', { param: 'test' })).toBe('Value: test')
            expect(formatMessage('Value: {\tparam\t}', { param: 'test' })).toBe('Value: test')
            expect(formatMessage('Value: {\nparam\n}', { param: 'test' })).toBe('Value: test')
        })
    })

    describe('complex templates', () => {
        it('handles template with mixed content', () => {
            expect(
                formatMessage('User {username} has {count} items in {category}', {
                    username: 'john_doe',
                    count: 5,
                    category: 'cart'
                })
            ).toBe('User john_doe has 5 items in cart')
        })

        it('handles template with only parameters', () => {
            expect(formatMessage('{a}{b}{c}', { a: '1', b: '2', c: '3' })).toBe('123')
        })

        it('handles template with parameters at beginning and end', () => {
            expect(
                formatMessage('{prefix} middle {suffix}', { prefix: 'start', suffix: 'end' })
            ).toBe('start middle end')
        })
    })
})
