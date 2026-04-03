import z from 'zod'
import { userDtoSchema } from './user.dto.js'

export const userResponseDtoSchema = z.object({
    user: userDtoSchema
})

/** @exports @typedef {z.infer<typeof userResponseDtoSchema>} UserResponseDTO */
