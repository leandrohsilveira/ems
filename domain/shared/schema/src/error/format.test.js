import { describe, it, expect } from 'vitest'
import { formatError } from './format.js'

/**
 * @import { ValidationErrorDTO } from "./error.dto.js"
 * @import { ValidationIssue } from "./format.js"
 */

/**
 * Creates a mock Zod issue for testing purposes.
 * @param {Partial<ValidationIssue>} [overrides={}] - Properties to override the default issue values
 * @returns {ValidationIssue} A mock Zod issue object
 */
function makeIssue(overrides = {}) {
    return {
        code: 'custom',
        message: 'Custom error',
        path: [],
        ...overrides
    }
}

/**
 * Formats a ZodError with the provided issues and literals.
 * This is a helper function for testing the formatError function.
 * @param {ValidationIssue[]} issues - Array of Zod issues to format
 * @param {Record<string, string>} [literals={}] - Map of literal strings for error messages
 * @returns {ValidationErrorDTO} Formatted error response containing form and field errors
 */
function runFormatError(issues, literals = {}) {
    return formatError({ issues }, literals)
}

/**
 * @param {Record<string, string>} literals
 */
function makeLiterals(literals) {
    return literals
}

describe('formatError', () => {
    describe('base output', () => {
        it('returns empty form and fields for no issues', () => {
            expect(runFormatError([])).toEqual({ code: 'VALIDATION_FAILED', form: [], fields: {} })
        })

        it('handles a single error with no path', () => {
            expect(runFormatError([makeIssue({ message: 'Custom error' })])).toEqual({
                code: 'VALIDATION_FAILED',
                form: ['Custom error'],
                fields: {}
            })
        })

        it('handles both form-level and field-level errors simultaneously', () => {
            expect(
                runFormatError([
                    makeIssue({ message: 'Form error', path: [] }),
                    makeIssue({ message: 'Field error', path: ['email'] })
                ])
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: ['Form error'],
                fields: { email: ['Field error'] }
            })
        })
    })

    describe('stringifyPath', () => {
        it('stringifies flat paths', () => {
            expect(runFormatError([makeIssue({ path: ['user', 'email'] })])).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { 'user.email': ['Custom error'] }
            })
        })

        it('stringifies array paths', () => {
            expect(runFormatError([makeIssue({ path: ['categories', 0, 'name'] })])).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { 'categories[0].name': ['Custom error'] }
            })
        })

        it('stringifies nested array paths', () => {
            expect(
                runFormatError([makeIssue({ path: ['items', 0, 'variants', 1, 'name'] })])
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { 'items[0].variants[1].name': ['Custom error'] }
            })
        })
    })

    describe('accumulation', () => {
        it('accumulates multiple errors for the same path in order', () => {
            expect(
                runFormatError([
                    makeIssue({ message: 'Error 1', path: ['name'] }),
                    makeIssue({ message: 'Error 2', path: ['name'] })
                ])
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { name: ['Error 1', 'Error 2'] }
            })
        })

        it('accumulates multiple form-level errors in order', () => {
            expect(
                runFormatError([
                    makeIssue({ message: 'Form error 1' }),
                    makeIssue({ message: 'Form error 2' })
                ])
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: ['Form error 1', 'Form error 2'],
                fields: {}
            })
        })
    })

    describe('resolveMessage - invalid_type', () => {
        it.each([
            {
                name: 'path.invalid literal',
                literals: makeLiterals({
                    'age.invalid': 'Age is invalid',
                    'invalid.number': 'Must be a number',
                    invalid: 'Invalid value'
                }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { age: ['Age is invalid'] }
                }
            },
            {
                name: 'path literal',
                literals: makeLiterals({
                    age: 'Age must be a number',
                    'invalid.number': 'Must be a number',
                    invalid: 'Invalid value'
                }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { age: ['Age must be a number'] }
                }
            },
            {
                name: 'invalid.expected literal',
                literals: makeLiterals({
                    'invalid.number': 'Must be a number',
                    invalid: 'Invalid value'
                }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { age: ['Must be a number'] }
                }
            },
            {
                name: 'invalid literal',
                literals: makeLiterals({ invalid: 'Invalid value' }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { age: ['Invalid value'] }
                }
            },
            {
                name: 'issue.message fallback',
                literals: makeLiterals({}),
                expected: { code: 'VALIDATION_FAILED', form: [], fields: { age: ['Invalid type'] } }
            }
        ])('$name', ({ literals, expected }) => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'invalid_type',
                            message: 'Invalid type',
                            path: ['age'],
                            expected: 'number'
                        })
                    ],
                    literals
                )
            ).toEqual(expected)
        })

        it.each([
            {
                name: 'items[].name.invalid literal',
                literals: makeLiterals({ 'items[].name.invalid': 'Item name is invalid' }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { 'items[0].name': ['Item name is invalid'] }
                }
            },
            {
                name: 'items[].name literal',
                literals: makeLiterals({ 'items[].name': 'Item name must be a string' }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { 'items[0].name': ['Item name must be a string'] }
                }
            }
        ])('$name', ({ literals, expected }) => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'invalid_type',
                            message: 'Invalid type',
                            path: ['items', 0, 'name'],
                            expected: 'string'
                        })
                    ],
                    literals
                )
            ).toEqual(expected)
        })

        it('keeps invalid_type precedence across multiple matching literals', () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'invalid_type',
                            message: 'Invalid type',
                            path: ['age'],
                            expected: 'number'
                        })
                    ],
                    {
                        'age.invalid': 'Age is invalid',
                        age: 'Age must be a number',
                        'invalid.number': 'Must be a number',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({ code: 'VALIDATION_FAILED', form: [], fields: { age: ['Age is invalid'] } })
        })
    })

    describe('resolveMessage - invalid_format', () => {
        it.each([
            {
                name: 'path.format literal',
                literals: makeLiterals({
                    'email.format': 'Invalid email format',
                    'email.invalid': 'Invalid email',
                    email: 'Email is wrong',
                    'format.email': 'Must be a valid email',
                    format: 'Invalid format',
                    invalid: 'Invalid value'
                }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { email: ['Invalid email format'] }
                }
            },
            {
                name: 'path.invalid literal',
                literals: makeLiterals({
                    'email.invalid': 'Invalid email',
                    email: 'Email is wrong',
                    'format.email': 'Must be a valid email',
                    format: 'Invalid format',
                    invalid: 'Invalid value'
                }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { email: ['Invalid email'] }
                }
            },
            {
                name: 'path literal',
                literals: makeLiterals({
                    email: 'Email is wrong',
                    'format.email': 'Must be a valid email',
                    format: 'Invalid format',
                    invalid: 'Invalid value'
                }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { email: ['Email is wrong'] }
                }
            },
            {
                name: 'format.format literal',
                literals: makeLiterals({
                    'format.email': 'Must be a valid email',
                    format: 'Invalid format',
                    invalid: 'Invalid value'
                }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { email: ['Must be a valid email'] }
                }
            },
            {
                name: 'format literal',
                literals: makeLiterals({ format: 'Invalid format', invalid: 'Invalid value' }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { email: ['Invalid format'] }
                }
            },
            {
                name: 'invalid literal',
                literals: makeLiterals({ invalid: 'Invalid value' }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { email: ['Invalid value'] }
                }
            },
            {
                name: 'issue.message fallback',
                literals: makeLiterals({}),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { email: ['Invalid format'] }
                }
            }
        ])('$name', ({ literals, expected }) => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'invalid_format',
                            message: 'Invalid format',
                            path: ['email'],
                            format: 'email'
                        })
                    ],
                    literals
                )
            ).toEqual(expected)
        })

        it.each([
            {
                name: 'items[].email.format literal',
                literals: makeLiterals({ 'items[].email.format': 'Item email format is invalid' }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { 'items[0].email': ['Item email format is invalid'] }
                }
            },
            {
                name: 'items[].email.invalid literal',
                literals: makeLiterals({ 'items[].email.invalid': 'Item email is invalid' }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { 'items[0].email': ['Item email is invalid'] }
                }
            },
            {
                name: 'items[].email literal',
                literals: makeLiterals({ 'items[].email': 'Item email is wrong' }),
                expected: {
                    code: 'VALIDATION_FAILED',
                    form: [],
                    fields: { 'items[0].email': ['Item email is wrong'] }
                }
            }
        ])('$name', ({ literals, expected }) => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'invalid_format',
                            message: 'Invalid format',
                            path: ['items', 0, 'email'],
                            format: 'email'
                        })
                    ],
                    literals
                )
            ).toEqual(expected)
        })

        it('keeps invalid_format precedence across multiple matching literals', () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'invalid_format',
                            message: 'Invalid format',
                            path: ['email'],
                            format: 'email'
                        })
                    ],
                    {
                        'email.format': 'Invalid email format',
                        'email.invalid': 'Invalid email',
                        email: 'Email is wrong',
                        'format.email': 'Must be a valid email',
                        format: 'Invalid format',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { email: ['Invalid email format'] }
            })
        })
    })

    describe('resolveMessage - too_small', () => {
        it("'path.min literal'", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_small',
                            message: 'Too small',
                            path: ['age']
                        })
                    ],
                    {
                        'age.min': 'Age must be at least 18',
                        'age.invalid': 'Invalid age',
                        age: 'Age is invalid',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { age: ['Age must be at least 18'] }
            })
        })

        it("'path.invalid literal'", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_small',
                            message: 'Too small',
                            path: ['age']
                        })
                    ],
                    {
                        'age.invalid': 'Invalid age',
                        age: 'Age is invalid',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({ code: 'VALIDATION_FAILED', form: [], fields: { age: ['Invalid age'] } })
        })

        it("'path literal'", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_small',
                            message: 'Too small',
                            path: ['age']
                        })
                    ],
                    {
                        age: 'Age is invalid',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({ code: 'VALIDATION_FAILED', form: [], fields: { age: ['Age is invalid'] } })
        })

        it("'invalid literal'", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_small',
                            message: 'Too small',
                            path: ['age']
                        })
                    ],
                    {
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({ code: 'VALIDATION_FAILED', form: [], fields: { age: ['Invalid value'] } })
        })

        it("'issue.message fallback'", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_small',
                            message: 'Too small',
                            path: ['age']
                        })
                    ],
                    {}
                )
            ).toEqual({ code: 'VALIDATION_FAILED', form: [], fields: { age: ['Too small'] } })
        })

        it("'min.string literal' with template", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_small',
                            message: 'Too small',
                            path: ['username'],
                            minimum: 3,
                            origin: 'string'
                        })
                    ],
                    {
                        'min.string': 'Must be at least {minimum} characters',
                        'username.min': 'Username must be at least {minimum} characters',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { username: ['Username must be at least 3 characters'] }
            })
        })

        it("'min.number literal' with template", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_small',
                            message: 'Too small',
                            path: ['age'],
                            minimum: 18,
                            origin: 'number'
                        })
                    ],
                    {
                        'min.number': 'Must be at least {minimum} years old',
                        'age.min': 'Age must be at least {minimum}',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { age: ['Age must be at least 18'] }
            })
        })

        it("'min literal' with template", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_small',
                            message: 'Too small',
                            path: ['score'],
                            minimum: 0,
                            origin: 'number'
                        })
                    ],
                    {
                        min: 'Value must be at least {minimum}',
                        'score.min': 'Score must be at least {minimum}',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { score: ['Score must be at least 0'] }
            })
        })

        it('precedence: path.min > path.invalid > path > min.origin > min > invalid > issue.message', () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_small',
                            message: 'Too small',
                            path: ['value'],
                            minimum: 10,
                            origin: 'number'
                        })
                    ],
                    {
                        'value.min': 'Custom: at least {minimum}',
                        'value.invalid': 'Invalid value',
                        value: 'Value error',
                        'min.number': 'Generic number: {minimum}',
                        min: 'Generic: {minimum}',
                        invalid: 'Invalid'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { value: ['Custom: at least 10'] }
            })
        })

        it('falls back to min.origin when path.min not found', () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_small',
                            message: 'Too small',
                            path: ['count'],
                            minimum: 5,
                            origin: 'number'
                        })
                    ],
                    {
                        'min.number': 'Number must be at least {minimum}',
                        min: 'Generic: {minimum}',
                        invalid: 'Invalid'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { count: ['Number must be at least 5'] }
            })
        })

        it('falls back to min when neither path.min nor min.origin found', () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_small',
                            message: 'Too small',
                            path: ['amount'],
                            minimum: 1,
                            origin: 'number'
                        })
                    ],
                    {
                        min: 'Minimum value is {minimum}',
                        invalid: 'Invalid'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { amount: ['Minimum value is 1'] }
            })
        })
    })

    describe('resolveMessage - too_big', () => {
        it("'path.max literal'", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_big',
                            message: 'Too big',
                            path: ['quantity']
                        })
                    ],
                    {
                        'quantity.max': 'Quantity must be at most 100',
                        'quantity.invalid': 'Invalid quantity',
                        quantity: 'Quantity is invalid',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { quantity: ['Quantity must be at most 100'] }
            })
        })

        it("'path.invalid literal'", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_big',
                            message: 'Too big',
                            path: ['quantity']
                        })
                    ],
                    {
                        'quantity.invalid': 'Invalid quantity',
                        quantity: 'Quantity is invalid',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { quantity: ['Invalid quantity'] }
            })
        })

        it("'path literal'", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_big',
                            message: 'Too big',
                            path: ['quantity']
                        })
                    ],
                    {
                        quantity: 'Quantity is invalid',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { quantity: ['Quantity is invalid'] }
            })
        })

        it("'invalid literal'", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_big',
                            message: 'Too big',
                            path: ['quantity']
                        })
                    ],
                    {
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { quantity: ['Invalid value'] }
            })
        })

        it("'max.string literal' with template", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_big',
                            message: 'Too big',
                            path: ['description'],
                            maximum: 500,
                            origin: 'string'
                        })
                    ],
                    {
                        'max.string': 'Cannot exceed {maximum} characters',
                        'description.max': 'Description cannot exceed {maximum} characters',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { description: ['Description cannot exceed 500 characters'] }
            })
        })

        it("'max.number literal' with template", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_big',
                            message: 'Too big',
                            path: ['quantity'],
                            maximum: 100,
                            origin: 'number'
                        })
                    ],
                    {
                        'max.number': 'Cannot exceed {maximum} items',
                        'quantity.max': 'Quantity cannot exceed {maximum}',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { quantity: ['Quantity cannot exceed 100'] }
            })
        })

        it("'max literal' with template", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_big',
                            message: 'Too big',
                            path: ['price'],
                            maximum: 1000,
                            origin: 'number'
                        })
                    ],
                    {
                        max: 'Maximum value is {maximum}',
                        'price.max': 'Price cannot exceed {maximum}',
                        invalid: 'Invalid value'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { price: ['Price cannot exceed 1000'] }
            })
        })

        it('precedence: path.max > path.invalid > path > max.origin > max > invalid > issue.message', () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_big',
                            message: 'Too big',
                            path: ['value'],
                            maximum: 100,
                            origin: 'number'
                        })
                    ],
                    {
                        'value.max': 'Custom: cannot exceed {maximum}',
                        'value.invalid': 'Invalid value',
                        value: 'Value error',
                        'max.number': 'Generic number: {maximum}',
                        max: 'Generic: {maximum}',
                        invalid: 'Invalid'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { value: ['Custom: cannot exceed 100'] }
            })
        })

        it('falls back to max.origin when path.max not found', () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_big',
                            message: 'Too big',
                            path: ['count'],
                            maximum: 50,
                            origin: 'number'
                        })
                    ],
                    {
                        'max.number': 'Number cannot exceed {maximum}',
                        max: 'Generic: {maximum}',
                        invalid: 'Invalid'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { count: ['Number cannot exceed 50'] }
            })
        })

        it('falls back to max when neither path.max nor max.origin found', () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_big',
                            message: 'Too big',
                            path: ['amount'],
                            maximum: 99,
                            origin: 'number'
                        })
                    ],
                    {
                        max: 'Maximum value is {maximum}',
                        invalid: 'Invalid'
                    }
                )
            ).toEqual({
                code: 'VALIDATION_FAILED',
                form: [],
                fields: { amount: ['Maximum value is 99'] }
            })
        })

        it("'issue.message fallback'", () => {
            expect(
                runFormatError(
                    [
                        makeIssue({
                            code: 'too_big',
                            message: 'Too big',
                            path: ['quantity']
                        })
                    ],
                    {}
                )
            ).toEqual({ code: 'VALIDATION_FAILED', form: [], fields: { quantity: ['Too big'] } })
        })
    })
})
