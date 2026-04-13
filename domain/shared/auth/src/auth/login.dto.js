import z from 'zod'

export const loginDtoSchema = z.object({
    username: z.string(),
    password: z.string()
})

/** @exports @typedef {z.infer<typeof loginDtoSchema>} LoginDTO */
