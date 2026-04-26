import z from 'zod'
import { AccountType } from './account-type.js'

export const accountDtoSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    type: z.enum(AccountType.values()),
    currency: z.string(),
    balance: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
})

/** @exports @typedef {z.infer<typeof accountDtoSchema>} AccountDTO */
