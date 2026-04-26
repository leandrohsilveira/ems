import { i18n } from '@ems/domain-shared-schema'
import z from 'zod'
import { accountDtoSchema } from './account.dto.js'

const defaultLiterals = {
    'name.invalid': 'Account name is required',
    'name.max': 'Account name cannot exceed {maximum} characters',
    'initialBalance.invalid': 'Initial balance must be a non-negative number',
    'currency.invalid': 'Currency must be a valid ISO 4217 code'
}

export const createAccountDtoI18n = i18n(defaultLiterals, {
    pt_BR: {
        'name.invalid': 'O nome da conta é obrigatório',
        'name.max': 'O nome da conta não pode exceder {maximum} caracteres',
        'initialBalance.invalid': 'O saldo inicial deve ser um número não negativo',
        'currency.invalid': 'A moeda deve ser um código ISO 4217 válido'
    }
})

export const createAccountDtoSchema = z.object({
    name: z.string().nonempty().max(100),
    initialBalance: z.coerce.number().nonnegative().default(0),
    currency: z.string().length(3).default('BRL')
})

export const createAccountResponseDtoSchema = z.object({
    account: accountDtoSchema
})

/** @exports @typedef {z.infer<typeof createAccountDtoSchema>} CreateAccountDTO */
/** @exports @typedef {z.infer<typeof createAccountResponseDtoSchema>} CreateAccountResponseDTO */
