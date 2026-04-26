import { i18n } from '@ems/domain-shared-schema'
import z from 'zod'
import { accountDtoSchema } from './account.dto.js'

const defaultLiterals = {
    'name.invalid': 'Account name is required',
    'name.max': 'Account name cannot exceed {maximum} characters'
}

export const updateAccountDtoI18n = i18n(defaultLiterals, {
    pt_BR: {
        'name.invalid': 'O nome da conta é obrigatório',
        'name.max': 'O nome da conta não pode exceder {maximum} caracteres'
    }
})

export const updateAccountDtoSchema = z.object({
    name: z.string().nonempty().max(100)
})

export const updateAccountResponseDtoSchema = z.object({
    account: accountDtoSchema
})

/** @exports @typedef {z.infer<typeof updateAccountDtoSchema>} UpdateAccountDTO */
/** @exports @typedef {z.infer<typeof updateAccountResponseDtoSchema>} UpdateAccountResponseDTO */
