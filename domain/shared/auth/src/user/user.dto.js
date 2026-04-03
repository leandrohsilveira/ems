import z from 'zod'

export const roleSchema = z.enum(['USER', 'MANAGER', 'ADMIN'])

export const userDtoSchema = z.object({
    userId: z.uuid(),
    username: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.email(),
    role: roleSchema
})

/** @exports @typedef {z.infer<typeof roleSchema>} Role */
/** @exports @typedef {z.infer<typeof userDtoSchema>} UserDTO */
