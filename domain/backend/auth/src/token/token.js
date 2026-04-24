import { createEnum } from '@ems/utils'
import z from 'zod'

export const TokenTypes = createEnum({
    Bearer: 'Bearer'
})

export const accessTokenPayloadDtoSchema = z.object({
    sub: z.string(),
    username: z.string(),
    role: z.string(),
    jti: z.string(),
    iat: z.number(),
    exp: z.number(),
    type: z.literal(['access'])
})

export const refreshTokenPayloadDtoSchema = z.object({
    sub: z.string(),
    jti: z.string(),
    sessionId: z.string(),
    iat: z.number(),
    exp: z.number(),
    type: z.literal(['refresh'])
})

/** @exports @typedef {z.infer<typeof accessTokenPayloadDtoSchema>} AccessTokenPayloadDTO */
/** @exports @typedef {z.infer<typeof refreshTokenPayloadDtoSchema>} RefreshTokenPayloadDTO */

export { TokenServiceFailuresEnum } from './token.service.js'
