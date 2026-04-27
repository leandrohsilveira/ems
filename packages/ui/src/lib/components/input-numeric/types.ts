import type { InputProps } from '../input/types.js'

/**
 * Props for the InputNumeric component.
 * Extends InputProps, omits "type" prop and has additional props.
 */
export type InputNumericProps = Omit<InputProps, 'type'> & {
    locale?: string
    format?: Intl.NumberFormatOptions
}
