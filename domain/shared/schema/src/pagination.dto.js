import z from 'zod'

export const pageInputDtoSchema = z.object({
    size: z.coerce.number().default(10),
    cursor: z.string().nullable().optional()
})

const basePageDtoSchema = z.object({
    size: z.number(),
    nextPageCursor: z.string().nullable()
})

/**
 * @template {z.core.SomeType} T
 * @param {T} items
 */
export function createPageDtoSchema(items) {
    return basePageDtoSchema.safeExtend({
        items: z.array(items)
    })
}

/** @exports @typedef {z.infer<typeof pageInputDtoSchema>} PageInputDTO */
/**
 * @template T
 * @exports @typedef {z.infer<typeof basePageDtoSchema> & { items: T[] }} PageDTO
 */
