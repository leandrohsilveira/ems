/**
 * Message data transfer object for validation errors
 */
export type MessageDTO = {
    message: string
}

/**
 * Validation error data transfer object with field-level errors
 */
export type ValidationErrorDTO = {
    errors: Record<string, MessageDTO>
}
