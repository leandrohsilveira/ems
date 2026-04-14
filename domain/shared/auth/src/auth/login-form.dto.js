import z from 'zod'

export const loginFormDtoSchema = z.object({
    username: z.string('Must enter a valid username').nonempty('Username is required'),
    password: z.string('Must enter a valid password').nonempty('Password is required')
})

/** @exports @typedef {z.infer<typeof loginFormDtoSchema>} LoginFormDTO */
