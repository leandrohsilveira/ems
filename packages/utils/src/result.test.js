import { describe, it, expect, vi } from 'vitest'
import { ok, error, failure, tryCatch, tryCatchAsync } from './result.js'

describe('ok', () => {
    it('creates a successful result with data', () => {
        const result = ok('value')
        expect(result).toEqual({
            status: 'OK',
            data: 'value',
            error: null,
            params: null
        })
    })

    it('works with objects', () => {
        const data = { id: 1, name: 'test' }
        expect(ok(data).data).toBe(data)
    })

    it('works with numbers', () => {
        expect(ok(42).data).toBe(42)
    })

    it('works with null', () => {
        expect(ok(null).data).toBeNull()
    })

    it('works with undefined', () => {
        expect(ok(undefined).data).toBeUndefined()
    })

    it('works with arrays', () => {
        const arr = [1, 2, 3]
        expect(ok(arr).data).toBe(arr)
    })
})

describe('error', () => {
    it('creates an error result from an Error instance', () => {
        const err = new Error('something went wrong')
        const result = error(err)
        expect(result).toEqual({
            status: 'ERROR',
            error: err,
            data: null,
            params: null
        })
    })

    it('wraps non-Error values in an Error', () => {
        const result = error('oops')
        expect(result.status).toBe('ERROR')
        expect(result.data).toBeNull()
        expect(result.error).toBeInstanceOf(Error)
        expect(result.error.message).toBe('oops')
    })

    it('wraps objects in an Error with cause', () => {
        const cause = { code: 500 }
        const result = error(cause)
        expect(result.error).toBeInstanceOf(Error)
        expect(result.error.message).toBe('[object Object]')
        expect(result.error.cause).toBe(cause)
    })

    it('wraps numbers in an Error', () => {
        const result = error(404)
        expect(result.error).toBeInstanceOf(Error)
        expect(result.error.message).toBe('404')
    })
})

describe('failure', () => {
    it('creates a failure result with a code only', () => {
        const result = failure('NOT_FOUND')
        expect(result).toEqual({
            status: 'NOT_FOUND',
            params: null,
            data: null,
            error: null
        })
    })

    it('creates a failure result with a code and params', () => {
        const result = failure('VALIDATION_ERROR', { field: 'email' })
        expect(result).toEqual({
            status: 'VALIDATION_ERROR',
            params: { field: 'email' },
            data: null,
            error: null
        })
    })

    it('creates a failure result with explicit null params', () => {
        const result = failure('FORBIDDEN', null)
        expect(result.params).toBeNull()
    })
})

describe('tryCatch', () => {
    it('returns the result of a successful function', () => {
        const result = tryCatch(() => 'success', vi.fn())
        expect(result).toBe('success')
    })

    it('does not call catchFailure on success', () => {
        const catchFn = vi.fn()
        tryCatch(() => 42, catchFn)
        expect(catchFn).not.toHaveBeenCalled()
    })

    it('calls catchFailure when fn throws', () => {
        const catchFn = vi.fn(() => 'recovered')
        const result = tryCatch(() => {
            throw new Error('fail')
        }, catchFn)
        expect(result).toBe('recovered')
        expect(catchFn).toHaveBeenCalledWith(expect.objectContaining({ message: 'fail' }))
    })

    it('wraps non-Error thrown values in an Error', () => {
        const catchFn = vi.fn(() => 'recovered')
        tryCatch(() => {
            throw 'string error'
        }, catchFn)
        expect(catchFn).toHaveBeenCalledWith(new Error('string error'))
    })

    it('preserves the thrown Error when it is already an Error', () => {
        const err = new Error('original')
        const catchFn = vi.fn(() => 'recovered')
        tryCatch(() => {
            throw err
        }, catchFn)
        expect(catchFn).toHaveBeenCalledWith(err)
    })
})

describe('tryCatchAsync', () => {
    it('returns the resolved value of a successful async function', async () => {
        const result = await tryCatchAsync(async () => 'success', vi.fn())
        expect(result).toBe('success')
    })

    it('does not call catchFailure on success', async () => {
        const catchFn = vi.fn()
        await tryCatchAsync(async () => 42, catchFn)
        expect(catchFn).not.toHaveBeenCalled()
    })

    it('calls catchFailure when async fn rejects', async () => {
        const catchFn = vi.fn(async () => 'recovered')
        const result = await tryCatchAsync(async () => {
            throw new Error('fail')
        }, catchFn)
        expect(result).toBe('recovered')
        expect(catchFn).toHaveBeenCalledWith(expect.objectContaining({ message: 'fail' }))
    })

    it('wraps non-Error rejected values in an Error', async () => {
        const catchFn = vi.fn(async () => 'recovered')
        await tryCatchAsync(async () => {
            throw 'string error'
        }, catchFn)
        expect(catchFn).toHaveBeenCalledWith(new Error('string error'))
    })

    it('preserves the rejected Error when it is already an Error', async () => {
        const err = new Error('original')
        const catchFn = vi.fn(async () => 'recovered')
        await tryCatchAsync(async () => {
            throw err
        }, catchFn)
        expect(catchFn).toHaveBeenCalledWith(err)
    })
})
