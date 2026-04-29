import { resolve } from '@ems/i18n'
import { defaultLanguage, makeHttpErrorMapper } from '@ems/domain-shared-schema'
import { accountErrorsI18n } from '@ems/domain-shared-account'
import { editAccountFormModalI18n } from '$lib/components/account-form-modal/account-form-modal.i18n.js'
import { createAccountApi } from '$lib/api/account.api.js'

/**
 * @import { AvailableLanguages, ErrorDTO } from "@ems/domain-shared-schema"
 * @import { AccountFormModalLiterals } from "$lib/components/account-form-modal/account-form-modal.i18n.js"
 * @import { AccountDTO } from "@ems/domain-shared-account"
 * @import { HttpClient } from "@ems/http"
 */

/**
 * @exports @typedef EditAccountLoaderResult
 * @property {boolean} isSuccess
 * @property {number} status
 * @property {AccountDTO} [account]
 * @property {AccountFormModalLiterals} literals
 * @property {string} [errorMessage]
 */

const mapError = makeHttpErrorMapper(accountErrorsI18n, {
    handleHttp(error, literals) {
        if (error.status === 404) return { status: 404, message: literals.accountNotFound }
    }
})

/**
 * @param {object} options
 * @param {string} options.id
 * @param {HttpClient<ErrorDTO>} options.client
 * @param {AvailableLanguages} [options.locale=defaultLanguage]
 * @returns {Promise<EditAccountLoaderResult>}
 */
export async function editAccountLoader({ id, client, locale = defaultLanguage }) {
    const literals = resolve(locale, editAccountFormModalI18n)
    const api = createAccountApi(client)

    const { ok, data, error } = await api.getAccountById(id)

    if (!ok)
        return {
            ...mapError(locale, error),
            literals
        }

    return {
        isSuccess: true,
        status: 200,
        account: data.account,
        literals
    }
}
