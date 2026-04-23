import z from 'zod'

export const errorDtoSchema = z.object({
    code: z.enum(['HTTP', 'UNEXPECTED']),
    message: z.string()
})

export const validationResultDtoSchema = z.object({
    form: z.array(z.string()).optional(),
    fields: z.record(z.string(), z.array(z.string()))
})

export const validationErrorDtoSchema = validationResultDtoSchema.safeExtend({
    code: z.enum(['VALIDATION_FAILED']).default('VALIDATION_FAILED')
})

/** @exports @typedef {z.infer<typeof validationResultDtoSchema>} ValidationResultDTO */
/** @exports @typedef {z.infer<typeof validationErrorDtoSchema>} ValidationErrorDTO */
/** @exports @typedef {z.infer<typeof errorDtoSchema>} HttpErrorDTO */
/** @exports @typedef {HttpErrorDTO | ValidationErrorDTO} ErrorDTO */
