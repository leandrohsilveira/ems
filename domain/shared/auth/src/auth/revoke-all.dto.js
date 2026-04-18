import { i18n } from '@ems/domain-shared-schema'
import z from 'zod'

const defaultLiterals = {
    'userId.invalid': 'Must provide a valid user ID'
}

export const revokeAllDtoI18n = i18n(defaultLiterals, {
    pt_BR: {
        'userId.invalid': 'Deve fornecer um ID de usuário valido'
    }
})

export const revokeAllDtoSchema = z.object({
    userId: z.string()
})

/** @exports @typedef {z.infer<typeof revokeAllDtoSchema>} RevokeAllDTO */
