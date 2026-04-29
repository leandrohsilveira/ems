import { jsonRequest, jsonResponse } from '@ems/http'
import {
    updateAccountDtoI18n,
    updateAccountDtoSchema,
    updateAccountResponseDtoSchema,
    accountErrorsI18n
} from '@ems/domain-shared-account'
import {
    createFormDataValidator,
    defaultLanguage,
    makeHttpErrorMapper
} from '@ems/domain-shared-schema'

/**
 * @import { HttpClient } from "@ems/http"
 * @import { AvailableLanguages, ErrorDTO } from "@ems/domain-shared-schema"
 * @import { AccountDTO } from "@ems/domain-shared-account"
 */

/**
 * @exports @typedef SubmitUpdateAccountResult
 * @property {boolean} isSuccess
 * @property {number} status
 * @property {AccountDTO} [account]
 * @property {string} [errorMessage]
 * @property {import('@ems/domain-shared-schema').ValidationResultDTO} [errors]
 */

const validate = createFormDataValidator({
    schema: updateAccountDtoSchema,
    i18n: updateAccountDtoI18n,
    mapper: {
        name: 'name'
    }
})

const mapError = makeHttpErrorMapper(accountErrorsI18n, {
    handleHttp(error, literals) {
        if (error.status === 404) {
            return { status: 404, message: literals.accountNotFound }
        }
        if (error.status === 403) {
            return { status: 403, message: literals.accountNotOwned }
        }
    }
})

/**
 * @param {object} data
 * @param {HttpClient<ErrorDTO>} data.client
 * @param {string} data.accountId
 * @param {FormData} data.form
 * @param {AvailableLanguages} [data.locale=defaultLanguage]
 * @returns {Promise<SubmitUpdateAccountResult>}
 */
export async function submitUpdateAccountAction({
    locale = defaultLanguage,
    client,
    accountId,
    form
}) {
    const { success, data: formData, error: validationError } = validate(locale, form)

    if (!success) {
        return {
            isSuccess: false,
            status: 400,
            errors: validationError
        }
    }

    const {
        ok,
        data: response,
        error: apiError
    } = await client.patch(`/accounts/${accountId}`, {
        request: jsonRequest({ name: formData.name }),
        response: jsonResponse()
    })

    if (!ok) return mapError(locale, apiError)

    const { account } = updateAccountResponseDtoSchema.parse(response)

    return {
        isSuccess: true,
        status: 200,
        account
    }
}
