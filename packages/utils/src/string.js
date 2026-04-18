/**
 * Formats a message template by replacing parameters with values.
 *
 * @param {string} template - The message template containing parameters in curly braces, e.g., "Value must be at least {minLength} characters"
 * @param {Record<string, any>} params - An object containing values for the parameters
 * @returns {string} The formatted message with parameters replaced
 *
 * @example
 * formatMessage('Value must be at least {minLength} characters', { minLength: 5 })
 * // Returns: 'Value must be at least 5 characters'
 *
 * @example
 * formatMessage('Hello {name}, welcome to {app}!', { name: 'John', app: 'MyApp' })
 * // Returns: 'Hello John, welcome to MyApp!'
 */
export function formatMessage(template, params) {
    if (!template || typeof template !== 'string') {
        return ''
    }

    if (!params || typeof params !== 'object') {
        return template
    }

    // Replace all occurrences of {paramName} with the corresponding value
    return template.replace(/\{([^{}]+)\}/g, (match, paramName) => {
        // Trim the parameter name to handle potential whitespace
        const key = paramName.trim()

        // Check if the parameter exists in the params object
        if (key in params) {
            const value = params[key]
            // Convert value to string, handling null and undefined
            return value != null ? String(value) : ''
        }

        // If parameter not found, keep the original placeholder
        return match
    })
}
