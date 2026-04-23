import { jsonRequest, jsonResponse } from '@ems/http'
import { loginDtoI18n, loginDtoSchema, loginErrorsI18n } from '@ems/domain-shared-auth'
import {
    createFormDataValidator,
    defaultLanguage,
    makeHttpErrorMapper
} from '@ems/domain-shared-schema'

/**
 * @import { HttpClient } from "@ems/http"
 * @import { AvailableLanguages, ErrorDTO } from "@ems/domain-shared-schema"
 */

/**
 * @exports @typedef SubmitLoginResult
 * @property {boolean} isSuccess
 * @property {number} status
 * @property {string} [errorMessage]
 * @property {import('@ems/domain-shared-schema').ValidationResultDTO} [errors]
 * @property {import('@ems/domain-shared-auth').TokenDTO} [tokens]
 */

const validate = createFormDataValidator({
    schema: loginDtoSchema,
    i18n: loginDtoI18n,
    mapper: {
        username: 'username',
        password: 'password'
    }
})

const mapError = makeHttpErrorMapper(loginErrorsI18n, {
    handleHttp(error, literals) {
        if (error.status === 401)
            return {
                status: 401,
                message: literals.incorrectUsernameOrPassword
            }
    }
})

/**
 * Handles user login form submission with comprehensive error mapping.
 *
 * @param {object} data
 * @param {HttpClient<ErrorDTO>} data.client - HTTP client configured with API base URL
 * @param {FormData} data.form - Form data from login form submission
 * @param {AvailableLanguages} [data.locale=defaultLanguage] - The user's preferred language for error messages and UI localization
 * @returns {Promise<SubmitLoginResult>} Result object with success status, tokens, and error details
 */
export async function submitLoginAction({ locale = defaultLanguage, client, form }) {
    const { success, data: formData, error: validationError } = validate(locale, form)

    if (!success)
        return {
            isSuccess: false,
            status: 400,
            errors: validationError
        }

    const {
        ok,
        data: tokens,
        error: loginError
    } = await client.post('/auth/login', {
        request: jsonRequest(formData),
        response: jsonResponse()
    })

    if (!ok) return mapError(locale, loginError)

    return {
        isSuccess: true,
        status: 200,
        tokens
    }
}
