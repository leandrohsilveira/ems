import { i18n } from '@ems/domain-shared-schema'

/**
 * @import { InferLiterals } from "@ems/i18n"
 */

/** @exports @typedef {InferLiterals<typeof loginFormI18n>} LoginFormLiterals */

export const defaultLiterals = {
    title: 'Sign In - EMS',
    headerApp: 'EMS',
    header: 'Sign In',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter your username',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMeLabel: 'Remember me',
    signInButton: 'Sign In',
    signInButtonAria: 'Sign in button',
    noAccountText: "Don't have an account?",
    createAccountLink: 'Create Account',
    formAriaLabel: 'User login form'
}

export const loginFormI18n = i18n(defaultLiterals, {
    pt_BR: {
        title: 'Entrar - EMS',
        headerApp: 'EMS',
        header: 'Entrar',
        usernameLabel: 'Usuário',
        usernamePlaceholder: 'Digite seu usuário',
        passwordLabel: 'Senha',
        passwordPlaceholder: 'Digite sua senha',
        rememberMeLabel: 'Lembrar-me',
        signInButton: 'Entrar',
        signInButtonAria: 'Botão de entrar',
        noAccountText: 'Não tem uma conta?',
        createAccountLink: 'Criar Conta',
        formAriaLabel: 'Formulário de login do usuário'
    }
})
