import { makeI18n, setupLanguages } from '@ems/i18n'

const { languages, alternatives, defaultLanguage } = setupLanguages(['en_US', 'pt_BR'], 'en_US')

export const i18n = makeI18n(alternatives)

export { languages, defaultLanguage }

/** @exports @typedef {typeof languages[number]} AvailableLanguages */
/** @exports @typedef {typeof alternatives[number]} AlternativeLanguages */
