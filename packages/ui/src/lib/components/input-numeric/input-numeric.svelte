<script>
    import Input from '../input/input.svelte'
    import { applyFormat, normalizeFormatterOptions } from './format.js'

    /**
     * @import { FormEventHandler } from 'svelte/elements'
     * @import { InputNumericProps } from './types.js'
     */

    /** @type {InputNumericProps} */
    let { format, locale = 'en', value = $bindable(''), oninput, ...restProps } = $props()

    // NOTE: intentionally untracked
    let internalValue = value

    let formatter = $derived(new Intl.NumberFormat(locale, normalizeFormatterOptions(format)))

    $effect(() => {
        if (formatter && internalValue !== value) {
            const formatted = applyFormat(formatter, value)
            internalValue = formatted.value
            value = formatted.value
        }
    })

    /** @type {FormEventHandler<HTMLInputElement>} */
    const handleInput = (event) => {
        const formatted = applyFormat(formatter, event.currentTarget.value)
        internalValue = formatted.value
        value = formatted.value
        oninput?.(event)
    }
</script>

<Input {...restProps} type="text" {value} oninput={handleInput} />
