import { resolve } from '@ems/i18n'
import { defaultLanguage } from '@ems/domain-shared-schema'
import { createAccountFormModalI18n } from '$lib/components/account-form-modal/account-form-modal.i18n.js'

/**
 * @import { AvailableLanguages } from "@ems/domain-shared-schema"
 * @import { AccountFormModalLiterals } from "$lib/components/account-form-modal/account-form-modal.i18n.js"
 */

/**
 * @param {object} [options={}]
 * @param {AvailableLanguages} [options.locale=defaultLanguage]
 * @returns {Promise<{ literals: AccountFormModalLiterals }>}
 */
export async function createAccountLoader({ locale = defaultLanguage } = {}) {
    const literals = resolve(locale, createAccountFormModalI18n)

    return { literals }
}
