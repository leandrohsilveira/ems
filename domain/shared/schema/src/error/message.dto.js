import z from 'zod'

export const messageDtoSchema = z.object({
    message: z.string()
})

/** @exports @typedef {z.infer<typeof messageDtoSchema>} MessageDTO */
