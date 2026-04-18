import { i18n } from '@ems/domain-shared-schema'

/**
 * @import { InferLiterals } from "@ems/i18n"
 */

/** @exports @typedef {InferLiterals<typeof signupFormI18n>} SignupFormLiterals */

export const defaultLiterals = {
    title: 'Create Account - EMS',
    headerApp: 'EMS',
    header: 'Create Account',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter your username',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your email',
    firstNameLabel: 'First Name (Optional)',
    firstNamePlaceholder: 'Enter your first name',
    lastNameLabel: 'Last Name (Optional)',
    lastNamePlaceholder: 'Enter your last name',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password',
    signUpButton: 'Sign Up',
    signUpButtonAria: 'Signup button',
    hasAccountText: 'Already have an account?',
    signInLink: 'Sign In',
    formAriaLabel: 'User sign-up form'
}

export const signupFormI18n = i18n(defaultLiterals, {
    pt_BR: {
        title: 'Criar Conta - EMS',
        headerApp: 'EMS',
        header: 'Criar Conta',
        usernameLabel: 'Usuário',
        usernamePlaceholder: 'Digite seu usuário',
        emailLabel: 'E-mail',
        emailPlaceholder: 'Digite seu e-mail',
        firstNameLabel: 'Nome (Opcional)',
        firstNamePlaceholder: 'Digite seu nome',
        lastNameLabel: 'Sobrenome (Opcional)',
        lastNamePlaceholder: 'Digite seu sobrenome',
        passwordLabel: 'Senha',
        passwordPlaceholder: 'Digite sua senha',
        confirmPasswordLabel: 'Confirmar Senha',
        confirmPasswordPlaceholder: 'Confirme sua senha',
        signUpButton: 'Criar Conta',
        signUpButtonAria: 'Botão de criar conta',
        hasAccountText: 'Já tem uma conta?',
        signInLink: 'Entrar',
        formAriaLabel: 'Formulário de cadastro do usuário'
    }
})
