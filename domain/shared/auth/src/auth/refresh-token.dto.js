import { i18n } from '@ems/domain-shared-schema'
import z from 'zod'

const defaultLiterals = {
    'refreshToken.invalid': 'Must provide a valid refresh token'
}

export const refreshTokenDtoI18n = i18n(defaultLiterals, {
    pt_BR: {
        'refreshToken.invalid': 'Deve fornecer um token de renovação válido'
    }
})

export const refreshTokenDtoSchema = z.object({
    refreshToken: z.string().nonempty()
})

/** @exports @typedef {z.infer<typeof refreshTokenDtoSchema>} RefreshTokenDTO */
