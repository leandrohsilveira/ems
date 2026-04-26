import z from 'zod'
import { ACCOUNT_TYPE } from './account-type.js'

export const accountDtoSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    type: z.nativeEnum(ACCOUNT_TYPE),
    currency: z.string(),
    balance: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
})

/** @exports @typedef {z.infer<typeof accountDtoSchema>} AccountDTO */
