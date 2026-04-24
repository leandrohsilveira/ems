/**
 * @template T
 * @exports @typedef ResultOk
 * @property {'OK'} status
 * @property {T} data
 * @property {null} error
 * @property {null} params
 */

import { createEnum } from './enum.js'

/**
 * @exports @typedef ResultError
 * @property {'ERROR'} status
 * @property {null} data
 * @property {Error} error
 * @property {null} params
 */

/**
 * @template {string} C
 * @template [P=null]
 * @exports @typedef ResultFailure
 * @property {C} status
 * @property {null} data
 * @property {null} error
 * @property {P} params
 */

export const ResultStatus = createEnum({
    OK: 'OK',
    ERROR: 'ERROR'
})

/**
 * @template T
 * @param {T} data
 * @returns {ResultOk<T>}
 */
export function ok(data) {
    return {
        status: 'OK',
        data,
        error: null,
        params: null
    }
}

/**
 * @param {unknown} cause
 * @returns {ResultError}
 */
export function error(cause) {
    return {
        status: 'ERROR',
        error: cause instanceof Error ? cause : new Error(String(cause), { cause }),
        data: null,
        params: null
    }
}

/**
 * @template {string} C
 * @overload
 * @param {C} code
 * @returns {ResultFailure<C, null>}
 */
/**
 * @template {string} C
 * @template P
 * @overload
 * @param {C} code
 * @param {P} params
 * @returns {ResultFailure<C, P>}
 */
/**
 * @template {string} C
 * @template P
 * @param {C} code
 * @param {P | null} [params]
 * @returns {ResultFailure<C, P | null>}
 */
export function failure(code, params) {
    return {
        status: code,
        params: params ?? null,
        data: null,
        error: null
    }
}

/**
 * @template {() => *} Fn
 * @overload
 * @param {Fn} fn
 * @returns {ReturnType<Fn> | ResultError}
 */
/**
 * @template {() => *} Fn
 * @template {(err: Error) => *} CatchFn
 * @overload
 * @param {Fn} fn
 * @param {CatchFn} catchFailure
 * @returns {ReturnType<Fn> | ReturnType<CatchFn>}
 */
/**
 * @template {() => *} Fn
 * @template {(err: Error) => *} CatchFn
 * @param {Fn} fn
 * @param {CatchFn} [catchFailure]
 * @returns {ReturnType<Fn> | ReturnType<CatchFn> | ResultError}
 */
export function tryCatch(fn, catchFailure) {
    try {
        return fn()
    } catch (cause) {
        if (!catchFailure) return error(cause)
        return catchFailure(cause instanceof Error ? cause : new Error(String(cause), { cause }))
    }
}

/**
 * @template {() => Promise<*>} Fn
 * @overload
 * @param {Fn} fn
 * @returns {Promise<(ReturnType<Fn> extends Promise<infer R1> ? R1 : never) | ResultError>}
 */
/**
 * @template {() => Promise<*>} Fn
 * @template {(err: Error) => Promise<*>} CatchFn
 * @overload
 * @param {Fn} fn
 * @param {CatchFn} catchFailure
 * @returns {Promise<(ReturnType<Fn> extends Promise<infer R1> ? R1 : never) | (ReturnType<CatchFn> extends Promise<infer R2> ? R2 : never)>}
 */
/**
 * @template {() => Promise<*>} Fn
 * @template {(err: Error) => Promise<*>} CatchFn
 * @param {Fn} fn
 * @param {CatchFn} [catchFailure]
 * @returns {Promise<(ReturnType<Fn> extends Promise<infer R1> ? R1 : never) | (ReturnType<CatchFn> extends Promise<infer R2> ? R2 : never) | ResultError>}
 */
export async function tryCatchAsync(fn, catchFailure) {
    try {
        return await fn()
    } catch (cause) {
        if (!catchFailure) return error(cause)
        return await catchFailure(
            cause instanceof Error ? cause : new Error(String(cause), { cause })
        )
    }
}
