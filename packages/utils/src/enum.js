/**
 * @template {Record<string, string>} E
 * @typedef {{ [K in keyof E]: K }} Enumeration
 */

/**
 * @template {Record<string, string>} E
 * @typedef {Readonly<Enumeration<E> & { values(): Array<keyof E> }>} EnumLike
 */

/**
 * @template {Record<string, *>} E
 * @param {Enumeration<E>} enumeration
 * @returns {EnumLike<E>}
 */
export function createEnum(enumeration) {
    const values = Object.keys(enumeration)
    return Object.freeze({
        ...enumeration,
        values: () => values
    })
}
