# Header Story - Component with User State

Example of a Storybook story for a header component that handles user authentication state.

## Component Features

- Props: `user` object with optional `name` property
- Events: `onLogin`, `onLogout`, `onCreateAccount`
- Layout: fullscreen (spans full viewport)

## Story Code

```svelte
<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import Header from './Header.svelte'
    import { fn } from 'storybook/test'

    const { Story } = defineMeta({
        title: 'Example/Header',
        component: Header,
        tags: ['autodocs'],
        parameters: {
            layout: 'fullscreen'
        },
        args: {
            onLogin: fn(),
            onLogout: fn(),
            onCreateAccount: fn()
        }
    })
</script>

<Story name="Logged In" args={{ user: { name: 'Jane Doe' } }} />

<Story name="Logged Out" />
```

## Key Features

1. **Multiple event handlers** - Each event gets its own `fn()` mock
2. **User state** - Different stories for logged-in vs logged-out states
3. **Fullscreen layout** - Component renders in full viewport
4. **No args on second story** - "Logged Out" uses default prop values (no user)

## When to Use

Use this pattern for:

- Navigation components
- Headers/footers
- Components with authentication state
- Components that span full width
