import { jsonResponse } from '@ems/http'
import { accountErrorsI18n } from '@ems/domain-shared-account'
import { defaultLanguage, makeHttpErrorMapper } from '@ems/domain-shared-schema'

/**
 * @import { HttpClient } from "@ems/http"
 * @import { AvailableLanguages, ErrorDTO } from "@ems/domain-shared-schema"
 */

/**
 * @exports @typedef SubmitDeleteAccountResult
 * @property {boolean} isSuccess
 * @property {number} status
 * @property {string} [errorMessage]
 */

const mapError = makeHttpErrorMapper(accountErrorsI18n, {
    handleHttp(error, literals) {
        if (error.status === 404) {
            return { status: 404, message: literals.accountNotFound }
        }
        if (error.status === 403) {
            return { status: 403, message: literals.accountNotOwned }
        }
        if (error.status === 409) {
            return { status: 409, message: literals.accountHasTransactions }
        }
    }
})

/**
 * @param {object} data
 * @param {HttpClient<ErrorDTO>} data.client
 * @param {string} data.accountId
 * @param {AvailableLanguages} [data.locale=defaultLanguage]
 * @returns {Promise<SubmitDeleteAccountResult>}
 */
export async function submitDeleteAccountAction({ locale = defaultLanguage, client, accountId }) {
    const { ok, error: apiError } = await client.delete(`/accounts/${accountId}`, {
        response: jsonResponse()
    })

    if (!ok) return mapError(locale, apiError)

    return {
        isSuccess: true,
        status: 200
    }
}
