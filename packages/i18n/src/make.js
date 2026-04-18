/**
 * @import { I18n, Imports, I18nInput } from "./types.js"
 */

/**
 * @template {string} L
 * @param {L[]} alternativeLanguages
 */
export function makeI18n(alternativeLanguages) {
    return i18n

    /**
     * @template {I18nInput} T
     * @template {Imports<L> | undefined} [I=undefined]
     * @param {T} def
     * @param {Record<L, T>} alternatives
     * @param {I} [imports]
     * @returns {I18n<L, T, I>}
     */
    function i18n(def, alternatives, imports) {
        return {
            imports,
            scope: {
                default: def,
                ...alternatives
            },
            default: /** @type {*} */ ({
                ...def,
                ...Object.fromEntries(
                    Object.entries(imports ?? {}).map(([key, imp]) => [key, imp.default])
                )
            }),
            alternatives: /** @type {*} */ (
                Object.fromEntries(
                    alternativeLanguages.map((lang) => [
                        lang,
                        {
                            ...alternatives[lang],
                            ...Object.fromEntries(
                                Object.entries(imports ?? {}).map(([key, imp]) => [
                                    key,
                                    imp.alternatives[lang]
                                ])
                            )
                        }
                    ])
                )
            )
        }
    }
}
