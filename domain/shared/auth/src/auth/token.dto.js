import z from 'zod'

export const tokenDtoSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    issuedAt: z.string(),
    tokenType: z.literal(['Bearer'])
})

export const refreshTokenDtoSchema = z.object({
    refreshToken: z.string()
})

/** @exports @typedef {z.infer<typeof tokenDtoSchema>} TokenDTO */
/** @exports @typedef {z.infer<typeof refreshTokenDtoSchema>} RefreshTokenDTO */
