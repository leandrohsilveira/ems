import { resolve } from '@ems/i18n'
import { defaultLanguage, makeHttpErrorMapper } from '@ems/domain-shared-schema'
import { accountErrorsI18n } from '@ems/domain-shared-account'
import { createAccountApi } from '../../api/account.api.js'
import { accountListI18n } from '../../components/account-list/account-list.i18n.js'

/**
 * @import { AvailableLanguages } from "@ems/domain-shared-schema"
 * @import { AccountDTO } from "@ems/domain-shared-account"
 * @import { HttpClient } from "@ems/http"
 * @import { AccountListLiterals } from "../../components/account-list/account-list.i18n.js"
 */

/**
 * @exports @typedef AccountListLoaderResult
 * @property {boolean} isSuccess
 * @property {number} status
 * @property {AccountDTO[]} accounts
 * @property {{ size: number, nextPageCursor: string | null }} pagination
 * @property {AccountListLiterals} literals
 * @property {string} [errorMessage]
 */

const mapError = makeHttpErrorMapper(accountErrorsI18n)

/**
 * @param {object} options
 * @param {HttpClient} options.client
 * @param {AvailableLanguages} [options.locale=defaultLanguage]
 * @returns {Promise<AccountListLoaderResult>}
 */
export async function accountListLoader({ client, locale = defaultLanguage }) {
    const accountApi = createAccountApi(client)
    const literals = resolve(locale, accountListI18n)
    const { ok, data: response, error } = await accountApi.listAccounts()

    if (!ok)
        return {
            ...mapError(locale, error),
            accounts: [],
            pagination: {
                size: 10,
                nextPageCursor: null
            },
            literals
        }

    return {
        isSuccess: true,
        status: 200,
        accounts: response.items,
        pagination: { size: response.size, nextPageCursor: response.nextPageCursor },
        literals
    }
}
