<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import Checkbox from './checkbox.svelte'

    const { Story } = defineMeta({
        title: 'Components/Checkbox',
        component: Checkbox,
        tags: ['autodocs'],
        argTypes: {
            checked: { control: 'boolean' },
            disabled: { control: 'boolean' },
            label: { control: 'text' },
            description: { control: 'text' }
        }
    })
</script>

<Story name="Default" args={{ label: 'Remember me' }} />

<Story name="Checked" args={{ label: 'Remember me', checked: true }} />

<Story
    name="WithDescription"
    args={{ label: 'Remember me', description: 'Stay logged in for 30 days' }}
/>

<Story name="Disabled" args={{ label: 'Remember me', disabled: true }} />

<Story name="DisabledChecked" args={{ label: 'Remember me', checked: true, disabled: true }} />
