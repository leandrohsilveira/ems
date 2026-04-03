/**
 * @template T
 * @param {T | T[] | null | undefined} input
 * @returns T[]
 */
export function asArray(input) {
    if (input === null || input === undefined) return []
    return Array.isArray(input) ? input : [input]
}
