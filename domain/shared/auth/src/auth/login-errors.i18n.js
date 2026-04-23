import { i18n } from '@ems/domain-shared-schema'

const defaultLiterals = {
    incorrectUsernameOrPassword: 'Incorrect username or password'
}

export const loginErrorsI18n = i18n(defaultLiterals, {
    pt_BR: {
        incorrectUsernameOrPassword: 'Usuário ou senha inválidos'
    }
})

/** @exports @typedef {import('@ems/domain-shared-schema').DefaultErrorLiterals & import('@ems/i18n').InferLiterals<typeof loginErrorsI18n>} LoginErrorsLiterals */
