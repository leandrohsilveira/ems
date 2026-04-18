import { loginFormI18n } from '$lib/components/login-form/login-form.i18n.js'
import { defaultLanguage } from '@ems/domain-shared-schema'
import { resolve } from '@ems/i18n'

/**
 * @import { AvailableLanguages } from "@ems/domain-shared-schema"
 */

/**
 * @param {object} [options={}]
 * @param {AvailableLanguages} [options.locale=defaultLanguage]
 */
export async function loginLoader({ locale = defaultLanguage } = {}) {
    return {
        literals: resolve(locale, loginFormI18n)
    }
}
