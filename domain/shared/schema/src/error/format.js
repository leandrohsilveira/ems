import { validationErrorDtoSchema } from './error.dto.js'
/**
 * @import { ZodError } from "zod"
 * @import { ValidationErrorDTO } from "./error.dto.js"
 */

/**
 * @template T
 * @param {ZodError<T>} input
 * @returns {ValidationErrorDTO}
 */
export function formatError(input) {
    /** @type {string[]} */
    const form = []

    /** @type {Record<string, string[]>} */
    const fields = {}

    for (const issue of input.issues) {
        if (issue.path.length === 0) {
            form.push(issue.message)
            continue
        }
        const path = stringifyPath(issue.path)

        fields[path] ??= []
        fields[path].push(issue.message)
    }

    return validationErrorDtoSchema.parse({
        form,
        fields
    })
}

/**
 * @param {PropertyKey[]} path
 * @returns {string}
 */
function stringifyPath(path) {
    return /** @type {typeof path.reduce<string>} */ (path.reduce)((acc, segment) => {
        if (typeof segment === 'number') return `${acc}[${segment}]`
        if (acc === '') return String(segment)
        return `${acc}.${String(segment)}`
    }, '')
}
