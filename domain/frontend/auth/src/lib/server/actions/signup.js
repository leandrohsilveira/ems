import { jsonRequest, jsonResponse } from '@ems/domain-shared-api'
import {
    signupRequestDtoSchema,
    signupRequestDtoI18n,
    signupFormDtoSchema
} from '@ems/domain-shared-auth'
import { createFormDataValidator, defaultLanguage } from '@ems/domain-shared-schema'

/** @import { HttpClient, HttpError, DefaultErrorFormat } from "@ems/domain-shared-api" */
/** @import { AvailableLanguages } from "@ems/domain-shared-schema" */

/**
 * @exports @typedef SubmitSignupResult
 * @property {boolean} isSuccess
 * @property {number} status
 * @property {string} [errorMessage]
 * @property {import('@ems/domain-shared-schema').ValidationErrorDTO} [errors]
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

/**
 * Handles user signup form submission with comprehensive error mapping.
 *
 * @param {object} data
 * @param {HttpClient} data.client - HTTP client configured with API base URL
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

    if (!ok)
        return {
            isSuccess: false,
            ...mapError(signupError)
        }

    return {
        isSuccess: true,
        status: 201
    }
}

/**
 * Error mapping logic:
 * - 400 (Validation): Returns structured field errors from Zod validation (handled in submitSignupAction)
 * - 409 (Conflict): Returns generic "Username or email already exists" message
 * - Network errors: Returns generic "Something went wrong. Please try again later." with status 500
 * - Other HTTP errors: Returns generic "Something went wrong. Please try again later." with original status
 * - Other errors: Returns generic "Something went wrong. Please try again later." with status 500
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

    if (error.type === 'HTTP_ERROR' && error.status === 409)
        return {
            status: error.status,
            errorMessage: 'Username or email already exists'
        }

    return {
        status: error.type === 'HTTP_ERROR' ? error.status : 500,
        errorMessage: 'Something went wrong. Please try again later.'
    }
}
