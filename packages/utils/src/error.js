/**
 * Safely extracts error message from unknown error type
 * @param {unknown} error - The error to extract message from
 * @returns {string} - Error message string
 */
export function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message
    }
    return String(error)
}
