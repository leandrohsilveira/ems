<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import InputNumeric from './input-numeric.svelte'

    const { Story } = defineMeta({
        title: 'Components/InputNumeric',
        component: InputNumeric,
        tags: ['autodocs'],
        argTypes: {
            label: { control: 'text' },
            description: { control: 'text' },
            error: { control: 'text' },
            disabled: { control: 'boolean' },
            placeholder: { control: 'text' },
            locale: { control: 'text' }
        }
    })
</script>

<Story name="Default" args={{ placeholder: 'Enter a number...' }} />

<Story name="With Label" args={{ label: 'Balance', placeholder: 'Enter the account balance' }} />

<Story
    name="With Description"
    args={{
        label: 'Balance',
        description: 'This will generate a manual balance change',
        placeholder: 'Enter the account balance'
    }}
/>

<Story
    name="With Error"
    args={{
        label: 'Balance',
        error: 'Please enter the balance value',
        placeholder: 'Enter the account balance'
    }}
/>

<Story
    name="Disabled"
    args={{ label: 'Disabled Input', disabled: true, placeholder: 'Cannot edit this' }}
/>

<Story
    name="Unit Format"
    args={{
        label: 'Distance',
        format: { style: 'unit', unit: 'meter' },
        placeholder: 'Enter distance in meters'
    }}
/>

<Story
    name="Decimal Format"
    args={{
        label: 'Value',
        format: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
        placeholder: 'Enter decimal value'
    }}
/>

<Story
    name="Currency Format"
    args={{
        label: 'Price',
        format: { style: 'currency', currency: 'USD' },
        placeholder: 'Enter amount'
    }}
/>

<Story
    name="Percent Format"
    args={{
        label: 'Rate',
        format: { style: 'percent' },
        placeholder: 'Enter percentage'
    }}
/>
