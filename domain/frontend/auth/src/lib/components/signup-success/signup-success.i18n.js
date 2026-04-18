import { i18n } from '@ems/domain-shared-schema'

/**
 * @import { InferLiterals } from "@ems/i18n"
 */

/** @exports @typedef {InferLiterals<typeof signupSuccessI18n>} SignupSuccessLiterals */

export const defaultLiterals = {
    title: 'Sign Up Successful - EMS',
    header: 'Sign Up Successful',
    successIconAria: 'Success icon',
    successMessage: 'Your account has been created successfully.',
    emailVerificationMessage: 'Please check your email to click the verification link.',
    loginLink: 'Go to Login'
}

export const signupSuccessI18n = i18n(defaultLiterals, {
    pt_BR: {
        title: 'Cadastro Realizado com Sucesso - EMS',
        header: 'Cadastro Realizado com Sucesso',
        successIconAria: 'Ícone de sucesso',
        successMessage: 'Sua conta foi criada com sucesso.',
        emailVerificationMessage: 'Verifique seu e-mail para clicar no link de verificação.',
        loginLink: 'Ir para o Login'
    }
})
