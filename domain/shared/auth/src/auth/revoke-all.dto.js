import z from 'zod'

export const revokeAllDtoSchema = z.object({
    userId: z.string()
})

/** @exports @typedef {z.infer<typeof revokeAllDtoSchema>} RevokeAllDTO */
