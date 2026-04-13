import z from 'zod'
import { userDtoSchema } from '@ems/domain-shared-auth'

export const sessionDtoSchema = z.object({
    id: z.string(),
    userId: z.string(),
    jti: z.string(),
    lastRefresh: z.date(),
    expiresAt: z.date(),
    user: userDtoSchema
})

/** @exports @typedef {z.infer<typeof sessionDtoSchema>} SessionDTO */
