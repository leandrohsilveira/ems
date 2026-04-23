import { jsonRequest, jsonResponse } from '@ems/http'
import {
    signupRequestDtoSchema,
    signupRequestDtoI18n,
    signupFormDtoSchema,
    signupErrorsI18n
} from '@ems/domain-shared-auth'
import {
    createFormDataValidator,
    defaultLanguage,
    makeHttpErrorMapper
} from '@ems/domain-shared-schema'

/** @import { HttpClient } from "@ems/http" */
/** @import { AvailableLanguages } from "@ems/domain-shared-schema" */

/**
 * @exports @typedef SubmitSignupResult
 * @property {boolean} isSuccess
 * @property {number} status
 * @property {string} [errorMessage]
 * @property {import('@ems/domain-shared-schema').ValidationResultDTO} [errors]
 */

const validate = createFormDataValidator({
    schema: signupFormDtoSchema,
    i18n: signupRequestDtoI18n,
    mapper: {
        email: 'email',
        username: 'username',
        password: 'password',
        confirmPassword: 'confirmPassword',
        firstName: 'firstName',
        lastName: 'lastName'
    }
})

const mapError = makeHttpErrorMapper(signupErrorsI18n, {
    handleHttp(error, literals) {
        if (error.status === 409)
            return {
                status: 409,
                message: literals.usernameOrEmailAlreadyExists
            }
    }
})

/**
 * Handles user signup form submission with comprehensive error mapping.
 *
 * @param {object} data
 * @param {HttpClient<import('@ems/domain-shared-schema').ErrorDTO>} data.client - HTTP client configured with API base URL
 * @param {FormData} data.form - Form data from signup form submission
 * @param {AvailableLanguages} [data.locale=defaultLanguage] - The user's preferred language for error messages and UI localization
 * @returns {Promise<SubmitSignupResult>} Result object with success status and error details
 */
export async function submitSignupAction({ locale = defaultLanguage, client, form }) {
    const { success, data: formData, error: validationError } = validate(locale, form)

    if (!success)
        return {
            isSuccess: false,
            status: 400,
            errors: validationError
        }

    // Convert form data to API request data (remove confirmPassword)
    const apiData = signupRequestDtoSchema.parse(formData)

    const { ok, error: signupError } = await client.post('/auth/signup', {
        request: jsonRequest(apiData),
        response: jsonResponse()
    })

    if (!ok) return mapError(locale, signupError)

    return {
        isSuccess: true,
        status: 201
    }
}
