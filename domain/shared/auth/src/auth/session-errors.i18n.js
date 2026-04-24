import { i18n } from '@ems/domain-shared-schema'

const defaultLiterals = {
    sessionExpired: 'Session expired',
    sessionNotFound: 'Session not found'
}

export const sessionErrorsI18n = i18n(defaultLiterals, {
    pt_BR: {
        sessionExpired: 'Sessão expirada',
        sessionNotFound: 'Sessão não encontrada'
    }
})

/** @exports @typedef {import('@ems/domain-shared-schema').DefaultErrorLiterals & import('@ems/i18n').InferLiterals<typeof sessionErrorsI18n>} AuthErrorsLiterals */
