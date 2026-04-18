/**
 * @import { I18n, I18nInput, InferLiterals, Imports } from "./types.js"
 */

/**
 * @template {string} Langs
 * @template {Langs} DefLang
 * @typedef Languages
 * @property {Langs[]} languages
 * @property {DefLang} defaultLanguage
 * @property {Exclude<Langs, DefLang>[]} alternatives
 */

/**
 * @template {string} Langs
 * @template {Langs} DefLang
 * @param {Langs[]} languages
 * @param {DefLang} defaultLanguage
 * @returns {Languages<Langs, DefLang>}
 */
export function setupLanguages(languages, defaultLanguage) {
    return {
        languages,
        defaultLanguage,
        alternatives: /** @type {*} */ (languages.filter((lang) => lang !== defaultLanguage))
    }
}

/**
 * @template {I18n<string, *, *>} I
 * @param {string} lang
 * @param {I} i18n
 * @returns {InferLiterals<I>}
 */
export function resolve(lang, i18n) {
    if (lang in i18n.alternatives) return i18n.alternatives[lang]
    return i18n.default
}

/**
 * @template Arg
 * @template {string} L
 * @template {I18n<L, I18nInput, Imports<L>>} I
 * @param {(arg: Arg) => L} producer
 * @param {I} i18n
 * @returns {(arg: Arg) => InferLiterals<I>}
 */
export function makeResolver(producer, i18n) {
    return (arg) => resolve(producer(arg), i18n)
}
