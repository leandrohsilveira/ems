import { i18n } from '@ems/domain-shared-schema'
import z from 'zod'

const defaultLiterals = {
    'username.invalid': 'Must enter a valid username',
    'username.min': 'Username must be at least {minimum} characters',
    'username.max': 'Username cannot exceed {maximum} characters',
    'username.regex': 'Username can only contain letters, numbers, underscores, and dashes',
    'email.invalid': 'Must enter a valid e-mail address',
    'email.max': 'Email cannot exceed {maximum} characters',
    'password.invalid': 'Must enter a valid password',
    'password.min': 'Password must be at least {minimum} characters',
    'password.max': 'Password cannot exceed {maximum} characters',
    'firstName.max': 'First name cannot exceed {maximum} characters',
    'lastName.max': 'Last name cannot exceed {maximum} characters',
    'confirmPassword.invalid': 'Must enter the password confirmation',
    'confirmPassword.mismatch': 'Must match the password'
}

export const signupRequestDtoI18n = i18n(defaultLiterals, {
    pt_BR: {
        'username.invalid': 'É necessário informar um nome de usuário válido',
        'username.min': 'O nome de usuário deve ter pelo menos {minimum} caracteres',
        'username.max': 'O nome de usuário não pode exceder {maximum} caracteres',
        'username.regex': 'O nome de usuário só pode conter letras, números, sublinhados e traços',
        'email.invalid': 'É necessário informar um endereço de e-mail válido',
        'email.max': 'O e-mail não pode exceder {maximum} caracteres',
        'password.invalid': 'É necessário informar uma senha válida',
        'password.min': 'A senha deve ter pelo menos {minimum} caracteres',
        'password.max': 'A senha não pode exceder {maximum} caracteres',
        'firstName.max': 'O primeiro nome não pode exceder {maximum} caracteres',
        'lastName.max': 'O sobrenome não pode exceder {maximum} caracteres',
        'confirmPassword.invalid': 'É necessário informar a confirmação da senha',
        'confirmPassword.mismatch': 'Deve corresponder à senha'
    }
})

export const signupRequestDtoSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_-]*$/),
    email: z.email().max(255),
    password: z.string().min(8).max(128),
    firstName: z.string().max(100).nullable(),
    lastName: z.string().max(100).nullable()
})

export const signupFormDtoSchema = signupRequestDtoSchema
    .extend({
        confirmPassword: z.string().nonempty()
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
        params: { code: 'mismatch' },
        path: ['confirmPassword'],
        when: () => true
    })

/** @exports @typedef {z.infer<typeof signupRequestDtoSchema>} SignupRequestDTO */
/** @exports @typedef {z.infer<typeof signupFormDtoSchema>} SignupFormDTO */
