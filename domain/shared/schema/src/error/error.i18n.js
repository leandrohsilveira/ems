import { i18n } from '../i18n.js'

/**
 * @import { ClientI18nLiterals } from "@ems/http"
 * @import { InferLiterals } from "@ems/i18n"
 */

/** @satisfies {ClientI18nLiterals} */
const defaultErrorLiterals = {
    serviceUnavailableError: 'Service temporarily unavailable. Please, try again later.',
    somethingWentWrongError: 'Something went wrong. Please, try again later.'
}

export const defaultErrorI18n = i18n(defaultErrorLiterals, {
    pt_BR: {
        serviceUnavailableError: 'Serviço indisponível. Por favor, tente novamente mais tarde.',
        somethingWentWrongError: 'Algo deu errado. Por favor, tente novamente mais tarde.'
    }
})

/** @exports @typedef {InferLiterals<typeof defaultErrorI18n>} DefaultErrorLiterals */
