import { i18n } from '@ems/domain-shared-schema'
import z from 'zod'

const defaultLiterals = {
    'username.invalid': 'Must enter the username',
    'password.invalid': 'Must enter the password'
}

export const loginDtoI18n = i18n(defaultLiterals, {
    pt_BR: {
        'username.invalid': 'É necessário informar o nome de usuário',
        'password.invalid': 'É necessário informar a senha'
    }
})

export const loginDtoSchema = z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty()
})

/** @exports @typedef {z.infer<typeof loginDtoSchema>} LoginDTO */
