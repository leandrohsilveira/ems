import { resolve as resolveI18n } from '@ems/i18n'
import { validationI18n } from './validation.i18n.js'
import { defaultErrorI18n } from './error.i18n.js'

/**
 * @import { I18n, InferLiterals } from "@ems/i18n"
 * @import { AlternativeLanguages, AvailableLanguages } from "../i18n.js"
 * @import { DefaultErrorLiterals } from "./error.i18n.js"
 */

/**
 * Merge the literals from a given i18n instance and the validationI18n for the same language.
 *
 * @param {AvailableLanguages} lang
 * @param {I18n<AlternativeLanguages, *, *>} [i18n]
 * @returns {Record<string, string>}
 */
export function resolveValidationLiterals(lang, i18n) {
    // Resolve literals from the provided i18n and the validation-specific i18n
    const base = resolveI18n(lang, /** @type {*} */ (validationI18n))
    const validation = i18n ? resolveI18n(lang, i18n) : null

    // Merge: validation literals should override base literals when keys collide
    return { ...base, ...validation }
}

/**
 * Merge the literals from a given i18n instance and the validationI18n for the same language.
 *
 * @template {I18n<AlternativeLanguages, *, *>} I
 * @param {AvailableLanguages} lang
 * @param {I} i18n
 * @returns {DefaultErrorLiterals & InferLiterals<I>}
 */
export function resolveErrorLiterals(lang, i18n) {
    // Resolve literals from the provided i18n and the validation-specific i18n
    const base = resolveI18n(lang, /** @type {*} */ (defaultErrorI18n))
    const validation = i18n ? resolveI18n(lang, i18n) : null

    // Merge: validation literals should override base literals when keys collide
    return { ...base, ...validation }
}
