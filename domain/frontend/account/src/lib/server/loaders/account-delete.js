import { resolve } from '@ems/i18n'
import { defaultLanguage, makeHttpErrorMapper } from '@ems/domain-shared-schema'
import { createAccountApi } from '$lib/api/account.api.js'
import { accountErrorsI18n } from '@ems/domain-shared-account'
import { deleteDialogI18n } from '$lib/components/delete-dialog/delete-dialog.i18n.js'

/**
 * @import { AvailableLanguages, ErrorDTO } from "@ems/domain-shared-schema"
 * @import { AccountDTO } from "@ems/domain-shared-account"
 * @import { HttpClient } from "@ems/http"
 * @import { DeleteDialogLiterals } from "$lib/components/delete-dialog/delete-dialog.i18n.js"
 */

/**
 * @exports @typedef EditAccountLoaderResult
 * @property {boolean} isSuccess
 * @property {number} status
 * @property {AccountDTO} [account]
 * @property {DeleteDialogLiterals} literals
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

export async function deleteAccountLoader({ id, client, locale = defaultLanguage }) {
    const literals = resolve(locale, deleteDialogI18n)
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
