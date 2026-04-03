import z from 'zod'

export const validationErrorDtoSchema = z.object({
    form: z.array(z.string()).optional(),
    fields: z.record(z.string(), z.array(z.string()))
})

/** @exports @typedef {z.infer<typeof validationErrorDtoSchema>} ValidationErrorDTO */
