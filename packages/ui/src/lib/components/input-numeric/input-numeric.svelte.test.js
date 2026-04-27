import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-svelte'
import InputNumeric from './input-numeric.svelte'
import { applyFormat, normalizeFormatterOptions } from './format.js'

describe('InputNumeric', () => {
    describe('base input behavior', () => {
        it('renders input element', async () => {
            const screen = render(InputNumeric)
            await expect.element(screen.getByRole('textbox')).toBeVisible()
        })

        it('renders with label', async () => {
            const screen = render(InputNumeric, { props: { label: 'Amount' } })
            await expect.element(screen.getByText('Amount')).toBeVisible()
        })

        it('renders with placeholder', async () => {
            const screen = render(InputNumeric, { props: { placeholder: 'Enter amount...' } })
            await expect
                .element(screen.getByRole('textbox'))
                .toHaveAttribute('placeholder', 'Enter amount...')
        })

        it('renders with description', async () => {
            const screen = render(InputNumeric, {
                props: { label: 'Amount', description: 'Enter the numeric value' }
            })
            await expect.element(screen.getByText('Enter the numeric value')).toBeVisible()
        })

        it('renders with error message', async () => {
            const screen = render(InputNumeric, {
                props: { label: 'Amount', error: 'Invalid amount' }
            })
            const input = screen.getByRole('textbox')
            await expect.element(input).toHaveAttribute('aria-invalid', 'true')
            await expect.element(screen.getByRole('alert')).toHaveTextContent('Invalid amount')
        })

        it('renders in disabled state', async () => {
            const screen = render(InputNumeric, { props: { disabled: true } })
            await expect.element(screen.getByRole('textbox')).toBeDisabled()
        })

        it('applies custom class', async () => {
            const screen = render(InputNumeric, { props: { class: 'custom-class' } })
            await expect.element(screen.getByRole('textbox')).toHaveClass(/custom-class/)
        })
    })

    describe('formatting', () => {
        it('formats unit values (no digits)', async () => {
            const screen = render(InputNumeric, {
                props: { format: { style: 'unit', unit: 'meter' } }
            })
            const input = screen.getByRole('textbox')
            await input.fill('123')
            await expect.element(input).toHaveValue('123')
        })

        it('formats decimal values with digits', async () => {
            const screen = render(InputNumeric, {
                props: {
                    format: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }
                }
            })
            const input = screen.getByRole('textbox')
            await input.fill('12345')
            await expect.element(input).toHaveValue('123.45')
        })

        it('formats currency values', async () => {
            const screen = render(InputNumeric, {
                props: { format: { style: 'currency', currency: 'USD' } }
            })
            const input = screen.getByRole('textbox')
            await input.fill('12345')
            await expect.element(input).toHaveValue('123.45')
        })

        it('formats percent values (no digits)', async () => {
            const screen = render(InputNumeric, {
                props: { format: { style: 'percent' } }
            })
            const input = screen.getByRole('textbox')
            await input.fill('50')
            await expect.element(input).toHaveValue('50')
        })

        it('formats percent values with digits', async () => {
            const screen = render(InputNumeric, {
                props: {
                    format: { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }
                }
            })
            const input = screen.getByRole('textbox')
            await input.fill('500')
            await expect.element(input).toHaveValue('50.0')
        })

        it('strips non-digit characters', async () => {
            const screen = render(InputNumeric, {
                props: { format: { style: 'unit', unit: 'meter' } }
            })
            const input = screen.getByRole('textbox')
            await input.fill('abc123def')
            await expect.element(input).toHaveValue('123')
        })

        it('returns value and unit separately from applyFormat', () => {
            const currencyFmt = new Intl.NumberFormat(
                'en',
                normalizeFormatterOptions({ style: 'currency', currency: 'USD' })
            )
            expect(applyFormat(currencyFmt, 'abc')).toEqual({ value: '', unit: '$' })
            expect(applyFormat(currencyFmt, '')).toEqual({ value: '', unit: '$' })
            expect(applyFormat(currencyFmt, '12345')).toEqual({ value: '123.45', unit: '$' })

            const unitFmt = new Intl.NumberFormat(
                'en',
                normalizeFormatterOptions({ style: 'unit', unit: 'meter' })
            )
            expect(applyFormat(unitFmt, '')).toEqual({ value: '', unit: 'm' })
            const unitResult = applyFormat(unitFmt, '123')
            expect(unitResult.value).toBe('123')
            expect(unitResult.unit).toBe('m')

            const percentFmt = new Intl.NumberFormat(
                'en',
                normalizeFormatterOptions({ style: 'percent' })
            )
            expect(applyFormat(percentFmt, '')).toEqual({ value: '', unit: '%' })
            expect(applyFormat(percentFmt, '50')).toEqual({ value: '50', unit: '%' })
        })

        it('defaults to decimal style with 0 digits when no format is provided', () => {
            const fmt = new Intl.NumberFormat('en', normalizeFormatterOptions())
            const result = applyFormat(fmt, '123')
            expect(result.value).toBe('123')
            expect(result.unit).toBe('')
        })
    })
})
