import { i18n } from '@ems/domain-shared-schema'

const defaultLiterals = {
    usernameOrEmailAlreadyExists: 'Username or email already exists'
}

export const signupErrorsI18n = i18n(defaultLiterals, {
    pt_BR: {
        usernameOrEmailAlreadyExists: 'Nome de usuário ou e-mail já existem'
    }
})

/** @exports @typedef {import('@ems/domain-shared-schema').DefaultErrorLiterals & import('@ems/i18n').InferLiterals<typeof signupErrorsI18n>} SignupErrorsLiterals */
