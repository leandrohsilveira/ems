import { assert } from '@ems/utils'

const unitTypes = ['unit', 'currency', 'percentSign']

/**
 * @param {Intl.NumberFormat} format
 * @param {string} value
 * @returns {{ value: string, unit: string }}
 */
export function applyFormat(format, value) {
    const options = format.resolvedOptions()

    const digits = getDigitsAmount(options)
    assert(digits >= 0, 'Format digits must be higher than zero')

    const unformatted = value.replace(/[^0-9]/g, '')
    const fraction = Number(unformatted === '' ? '0' : unformatted)
    const result = format.formatToParts(
        fraction / Math.pow(10, digits) / (options.style === 'percent' ? 100 : 1)
    )

    const unit = result
        .filter((p) => unitTypes.includes(p.type))
        .map((p) => p.value)
        .join('')

    if (unformatted === '') return { value: '', unit }

    const formattedValue = result
        .filter((p) => !unitTypes.includes(p.type))
        .map((p) => p.value)
        .join('')
        .trim()

    return {
        value: formattedValue,
        unit
    }
}

/**
 * @param {Intl.NumberFormatOptions | undefined} [options]
 * @returns {Intl.NumberFormatOptions}
 */
export function normalizeFormatterOptions(options) {
    const digits = getDigitsAmount(options)

    return {
        ...options,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    }
}

/**
 * @param {Intl.NumberFormatOptions} [options]
 * @returns {number}
 */
function getDigitsAmount({ style = 'decimal', minimumFractionDigits, maximumFractionDigits } = {}) {
    if (minimumFractionDigits !== undefined && maximumFractionDigits !== undefined)
        return Math.max(minimumFractionDigits, maximumFractionDigits)

    return (
        minimumFractionDigits ??
        maximumFractionDigits ??
        {
            currency: 2,
            decimal: 0,
            percent: 0,
            unit: 0
        }[style]
    )
}
