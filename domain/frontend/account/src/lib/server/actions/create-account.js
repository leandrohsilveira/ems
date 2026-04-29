import { jsonRequest, jsonResponse } from '@ems/http'
import {
    createAccountDtoI18n,
    createAccountDtoSchema,
    createAccountResponseDtoSchema,
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
 * @exports @typedef SubmitCreateAccountResult
 * @property {boolean} isSuccess
 * @property {number} status
 * @property {AccountDTO} [account]
 * @property {string} [errorMessage]
 * @property {import('@ems/domain-shared-schema').ValidationResultDTO} [errors]
 */

const validate = createFormDataValidator({
    schema: createAccountDtoSchema,
    i18n: createAccountDtoI18n,
    mapper: {
        name: 'name',
        initialBalance: 'initialBalance'
    }
})

const mapError = makeHttpErrorMapper(accountErrorsI18n)

/**
 * @param {object} data
 * @param {HttpClient<ErrorDTO>} data.client
 * @param {FormData} data.form
 * @param {AvailableLanguages} [data.locale=defaultLanguage]
 * @returns {Promise<SubmitCreateAccountResult>}
 */
export async function submitCreateAccountAction({ locale = defaultLanguage, client, form }) {
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
    } = await client.post('/accounts', {
        request: jsonRequest({
            name: formData.name,
            initialBalance: formData.initialBalance,
            currency: 'BRL'
        }),
        response: jsonResponse()
    })

    if (!ok) return mapError(locale, apiError)

    const { account } = createAccountResponseDtoSchema.parse(response)

    return {
        isSuccess: true,
        status: 201,
        account
    }
}
