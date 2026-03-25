<script module>
    import '../../index.css'
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import Button from './button.svelte'

    const { Story } = defineMeta({
        title: 'Components/Button',
        component: Button,
        tags: ['autodocs'],
        argTypes: {
            variant: {
                control: { type: 'select' },
                options: ['default', 'secondary', 'destructive', 'outline', 'ghost']
            },
            size: {
                control: { type: 'select' },
                options: ['default', 'large', 'icon']
            },
            loading: { control: 'boolean' },
            disabled: { control: 'boolean' }
        }
    })
</script>

<Story name="Default" args={{ variant: 'default', children: 'Button' }} />

<Story name="Secondary" args={{ variant: 'secondary', children: 'Button' }} />

<Story name="Destructive" args={{ variant: 'destructive', children: 'Button' }} />

<Story name="Outline" args={{ variant: 'outline', children: 'Button' }} />

<Story name="Ghost" args={{ variant: 'ghost', children: 'Button' }} />

<Story name="Large" args={{ size: 'large', children: 'Button' }} />

<Story name="Icon" args={{ size: 'icon', children: '+' }} />

<Story name="Loading" args={{ loading: true, children: 'Loading...' }} />

<Story name="Disabled" args={{ disabled: true, children: 'Button' }} />
