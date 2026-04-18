/**
 * @import { ZodType } from "zod"
 * @import { I18n } from "@ems/i18n"
 * @import { AvailableLanguages } from "../i18n.js"
 */

import { formatError } from './format.js'
import { resolveLiterals } from './resolve.js'

/** @exports @typedef {{ [key: string]: string | string[] | FormDataMapper | FormDataMapper[] | ((data: FormData) => (string | string[] | FormDataMapper | FormDataMapper[])) }} FormDataMapper */

/**
 * @template {ZodType} T
 * @param {object} options
 * @param {T} options.schema
 * @param {I18n<*, *, *>} options.i18n
 * @param {FormDataMapper[string]} options.mapper
 */
export function createFormDataValidator({ schema, i18n, mapper }) {
    return validate

    /**
     * @param {AvailableLanguages} locale
     * @param {FormData} formData
     */
    function validate(locale, formData) {
        const literals = resolveLiterals(locale, i18n)

        const { success, data, error } = schema.safeParse(mapFormData(formData, mapper))

        if (success) return /** @type {const} */ ({ success: true, data, error: null })

        return /** @type {const} */ ({
            success: false,
            data: null,
            error: formatError(error, literals)
        })
    }
}

/**
 * @param {FormData} data
 * @param {FormDataMapper[string]} mapper
 * @returns {unknown}
 */
function mapFormData(data, mapper) {
    if (typeof mapper === 'string') return data.get(mapper)
    if (Array.isArray(mapper)) return mapper.map((item) => mapFormData(data, item))
    if (typeof mapper === 'function') return mapFormData(data, mapper(data))
    return Object.fromEntries(
        Object.entries(mapper).map(([key, value]) => [key, mapFormData(data, value)])
    )
}
