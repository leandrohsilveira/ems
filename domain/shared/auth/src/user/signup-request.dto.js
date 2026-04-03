import z from 'zod'

export const signupRequestDtoSchema = z.object({
    username: z
        .string('Must enter a valid username')
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username cannot exceed 30 characters')
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            'Username can only contain letters, numbers, underscores, and dashes'
        ),
    email: z
        .email('Must enter a valid e-mail address')
        .max(255, 'Email cannot exceed 255 characters'),
    password: z
        .string('Must enter a valid password')
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password cannot exceed 128 characters'),
    firstName: z.string().max(100, 'First name cannot exceed 100 characters').nullable(),
    lastName: z.string().max(100, 'Last name cannot exceed 100 characters').nullable()
})

export const signupFormDtoSchema = signupRequestDtoSchema
    .extend({
        confirmPassword: z
            .string('Must enter the password confirmation')
            .nonempty('Must enter the password confirmation')
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
        error: 'Must match the password',
        path: ['confirmPassword'],
        when: () => true
    })

/** @exports @typedef {z.infer<typeof signupRequestDtoSchema>} SignupRequestDTO */
/** @exports @typedef {z.infer<typeof signupFormDtoSchema>} SignupFormDTO */
