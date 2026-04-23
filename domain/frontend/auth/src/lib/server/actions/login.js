import { jsonRequest, jsonResponse } from '@ems/http'
import { loginDtoI18n, loginDtoSchema } from '@ems/domain-shared-auth'
import { createFormDataValidator, defaultLanguage } from '@ems/domain-shared-schema'

/**
 * @import { HttpClient, HttpError, DefaultErrorFormat } from "@ems/http"
 * @import { AvailableLanguages } from "@ems/domain-shared-schema"
 */

/**
 * @exports @typedef SubmitLoginResult
 * @property {boolean} isSuccess
 * @property {number} status
 * @property {string} [errorMessage]
 * @property {import('@ems/domain-shared-schema').ValidationErrorDTO} [errors]
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

/**
 * Handles user login form submission with comprehensive error mapping.
 *
 * @param {object} data
 * @param {HttpClient} data.client - HTTP client configured with API base URL
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

    if (!ok)
        return {
            isSuccess: false,
            ...mapError(loginError)
        }

    return {
        isSuccess: true,
        status: 200,
        tokens
    }
}

/**
 * Error mapping logic:
 * - 400 (Validation): Returns structured field errors from Zod validation (handled in submitLoginAction)
 * - 401 (Unauthorized): Returns "Invalid username or password" message
 * - Network errors: Returns generic "Service temporarily unavailable" with status 500
 * - Other HTTP errors: Returns generic "Something went wrong" with original status
 * - Other errors: Returns generic "Something went wrong" with status 500
 *
 * @template [E=DefaultErrorFormat]
 * @param {HttpError<E>} error
 */
function mapError(error) {
    if (error.type === 'NETWORK_ERROR')
        return {
            status: 500,
            errorMessage: 'Service temporarily unavailable. Please try again later.'
        }

    if (error.type === 'HTTP_ERROR' && error.status === 401)
        return {
            status: error.status,
            errorMessage: 'Invalid username or password'
        }

    return {
        status: error.type === 'HTTP_ERROR' ? error.status : 500,
        errorMessage: 'Something went wrong. Please try again later.'
    }
}
