/**
 * @import { I18n, InferLiterals } from "@ems/i18n"
 * @import { HttpError, ParsedHttpResponseError } from "@ems/http"
 * @import { AlternativeLanguages, AvailableLanguages } from "../i18n.js"
 * @import { ErrorDTO, ValidationResultDTO } from "./error.dto.js"
 * @import { DefaultErrorLiterals } from "./error.i18n.js"
 */

import { resolveErrorLiterals } from './resolve.js'

/**
 * @exports @typedef HttpErrorHandleResult
 * @property {number} status
 * @property {string} message
 */

/**
 * @exports @typedef MapHttpErrorResult
 * @property {boolean} isSuccess
 * @property {number} status
 * @property {string} [errorMessage]
 * @property {ValidationResultDTO} [errors]
 */

/**
 * @template {I18n<AlternativeLanguages, *, *>} I
 * @param {I} i18n
 * @param {object} [options={}]
 * @param {(error: ParsedHttpResponseError<ErrorDTO>, literals: InferLiterals<I> & DefaultErrorLiterals) => HttpErrorHandleResult | undefined} [options.handleHttp]
 */
export function makeHttpErrorMapper(i18n, { handleHttp } = {}) {
    return handle

    /**
     * @param {AvailableLanguages} locale
     * @param {HttpError<ErrorDTO>} error
     * @returns {MapHttpErrorResult}
     */
    function handle(locale, error) {
        const literals = resolveErrorLiterals(locale, i18n)

        if (error.type === 'HTTP_ERROR' && error.parsed) {
            if (error.status === 400 && error.body.code === 'VALIDATION_FAILED')
                return {
                    isSuccess: false,
                    status: 400,
                    errors: error.body
                }

            const result = handleHttp?.(error, literals)

            if (result)
                return {
                    isSuccess: false,
                    status: result.status,
                    errorMessage: result.message
                }
        }
        if (error.type === 'NETWORK_ERROR')
            return {
                isSuccess: false,
                status: 503,
                errorMessage: literals.serviceUnavailableError
            }
        return {
            isSuccess: false,
            status: error.type === 'HTTP_ERROR' ? error.status : 500,
            errorMessage: literals.somethingWentWrongError
        }
    }
}
