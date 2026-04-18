import { validationErrorDtoSchema } from './error.dto.js'
import { formatMessage } from '@ems/utils'
/**
 * @import { ValidationErrorDTO } from "./error.dto.js"
 */

/**
 * @typedef {Object} ErrorPatternConfig
 * @property {string[]} patterns - Pattern templates in precedence order
 * @property {(issue: ValidationIssue) => Record<string, any>} extract - Extracts data for pattern interpolation
 * @property {((message: string, data: any) => string)} [format] - Optional formatter function
 */

/**
 * @exports @typedef {'invalid_type' | 'invalid_format' | 'too_small' | 'too_big' | 'custom' | string } ValidationIssueCode
 */

/**
 * @exports @typedef ValidationIssues
 * @property {ValidationIssue[]} issues
 */

/**
 * @exports @typedef ValidationIssue
 * @property {PropertyKey[]} path Path to the invalid property in the data structure (e.g., ["user", "email"])
 * @property {ValidationIssueCode} code Error code identifying the type of validation failure
 * @property {string} message Human-readable error message describing the validation failure
 * @property {string} [expected] Expected value or type when validation fails due to mismatch
 * @property {string} [format] Expected format (e.g., "email", "uuid", "date-time") when validation fails due to format violation
 * @property {string} [origin] Source or origin of the validation error (e.g., "schema", "custom", "external")
 * @property {number | bigint} [minimum] Minimum allowed value for numeric validation failures
 * @property {number | bigint} [maximum] Maximum allowed value for numeric validation failures
 * @property {Record<string, unknown>} [params] Additional parameters providing context for the validation error
 */

/**
 * Pattern configuration for different Zod error types.
 * @type {Record<ValidationIssueCode, ErrorPatternConfig>}
 */
const ERROR_PATTERNS = {
    invalid_type: {
        patterns: ['{path}.invalid', '{path}', 'invalid.{expected}'],
        extract: (issue) => ({ expected: issue.expected })
    },
    invalid_format: {
        patterns: [
            '{path}.{format}',
            '{path}.format',
            '{path}.invalid',
            '{path}',
            'format.{format}',
            'format'
        ],
        extract: (issue) => ({ format: issue.format })
    },
    too_small: {
        patterns: ['{path}.min', '{path}.invalid', '{path}', 'min.{origin}', 'min'],
        extract: (issue) => ({
            minimum: issue.minimum,
            origin: issue.origin
        }),
        format: formatMessage
    },
    too_big: {
        patterns: ['{path}.max', '{path}.invalid', '{path}', 'max.{origin}', 'max'],
        extract: (issue) => ({
            maximum: issue.maximum,
            origin: issue.origin
        }),
        format: formatMessage
    },
    custom: {
        patterns: ['{path}.{code}'],
        extract: (issue) => ({
            code: issue.params?.code ?? 'custom'
        })
    }
}

/**
 * @param {ValidationIssues} input
 * @returns {ValidationErrorDTO}
 */
export function formatError(input, literals = {}) {
    /** @type {string[]} */
    const form = []

    /** @type {Record<string, string[]>} */
    const fields = {}

    for (const issue of input.issues) {
        if (issue.path.length === 0) {
            form.push(resolveMessage(literals, issue))
            continue
        }
        const path = stringifyPath(issue.path)

        fields[path] ??= []
        fields[path].push(
            resolveMessage(literals, issue, stringifyPath(issue.path, { noindex: true }))
        )
    }

    return validationErrorDtoSchema.parse({
        form,
        fields
    })
}

/**
 * @param {Record<string, string>} literals
 * @param {ValidationIssue} issue
 * @param {string} [path]
 */
function resolveMessage(literals, issue, path) {
    const config = ERROR_PATTERNS[issue.code]

    if (config) {
        // Extract data for pattern interpolation
        const data = config.extract(issue)

        // Add path to data if available
        if (path) {
            data.path = path
        }

        // Try each pattern in precedence order
        for (const pattern of config.patterns) {
            // Skip patterns that require path when path is not available
            if (pattern.includes('{path}') && !path) {
                continue
            }

            const key = formatMessage(pattern, data)
            if (key in literals) {
                const message = literals[key]
                return config.format ? config.format(message, data) : message
            }
        }
    }

    // Fallback for unsupported error types or no matching patterns
    if ('invalid' in literals) return literals.invalid
    return issue.message
}

/**
 * @param {PropertyKey[]} path
 * @param {{ noindex?: boolean }} [options]
 * @returns {string}
 */
function stringifyPath(path, { noindex = false } = {}) {
    return /** @type {typeof path.reduce<string>} */ (path.reduce)((acc, segment) => {
        if (typeof segment === 'number') return noindex ? `${acc}[]` : `${acc}[${segment}]`
        if (acc === '') return String(segment)
        return `${acc}.${String(segment)}`
    }, '')
}
