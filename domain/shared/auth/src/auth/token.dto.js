import z from 'zod'

export const tokenDtoSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    issuedAt: z.string(),
    tokenType: z.literal(['Bearer'])
})

/** @exports @typedef {z.infer<typeof tokenDtoSchema>} TokenDTO */
