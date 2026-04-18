import { signupFormI18n } from '$lib/components/signup-form/signup-form.i18n.js'
import { signupSuccessI18n } from '$lib/components/signup-success/signup-success.i18n.js'
import { defaultLanguage } from '@ems/domain-shared-schema'
import { resolve } from '@ems/i18n'

/**
 * @import { AvailableLanguages } from "@ems/domain-shared-schema"
 */

/**
 * @param {object} [options={}]
 * @param {AvailableLanguages} [options.locale=defaultLanguage]
 */
export async function signupLoader({ locale = defaultLanguage } = {}) {
    return {
        literals: resolve(locale, signupFormI18n)
    }
}

/**
 * @param {object} [options={}]
 * @param {AvailableLanguages} [options.locale=defaultLanguage]
 */
export async function signupSuccessLoader({ locale = defaultLanguage } = {}) {
    return {
        literals: resolve(locale, signupSuccessI18n)
    }
}
