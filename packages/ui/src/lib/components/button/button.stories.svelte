<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import Button from './button.svelte'
    import { createRawSnippet } from 'svelte'

    const { Story } = defineMeta({
        title: 'Components/Button',
        component: Button,
        tags: ['autodocs'],
        argTypes: {
            element: {
                control: { type: 'select' },
                options: ['button', 'a']
            },
            variant: {
                control: { type: 'select' },
                options: ['default', 'secondary', 'destructive', 'outline', 'ghost']
            },
            size: {
                control: { type: 'select' },
                options: ['default', 'large', 'icon']
            },
            loading: { control: 'boolean' },
            disabled: { control: 'boolean' },
            href: { control: 'text' }
        }
    })
</script>

<Story
    name="Default"
    args={{ variant: 'default', children: createRawSnippet(() => ({ render: () => 'Button' })) }}
/>

<Story
    name="Secondary"
    args={{ variant: 'secondary', children: createRawSnippet(() => ({ render: () => 'Button' })) }}
/>

<Story
    name="Destructive"
    args={{
        variant: 'destructive',
        children: createRawSnippet(() => ({ render: () => 'Button' }))
    }}
/>

<Story
    name="Outline"
    args={{ variant: 'outline', children: createRawSnippet(() => ({ render: () => 'Button' })) }}
/>

<Story
    name="Ghost"
    args={{ variant: 'ghost', children: createRawSnippet(() => ({ render: () => 'Button' })) }}
/>

<Story
    name="Large"
    args={{ size: 'large', children: createRawSnippet(() => ({ render: () => 'Button' })) }}
/>

<Story
    name="Icon"
    args={{ size: 'icon', children: createRawSnippet(() => ({ render: () => '+' })) }}
/>

<Story
    name="Loading"
    args={{ loading: true, children: createRawSnippet(() => ({ render: () => 'Loading...' })) }}
/>

<Story
    name="Disabled"
    args={{ disabled: true, children: createRawSnippet(() => ({ render: () => 'Button' })) }}
/>
