# Button Story - Simple Component

Example of a basic Storybook story for a button component.

## Component Props

```javascript
/**
 * @typedef {Object} Props
 * @property {boolean} [primary] Is this the principal call to action on the page?
 * @property {string} [backgroundColor] What background color to use
 * @property {'small' | 'medium' | 'large'} [size] How large should the button be?
 * @property {string} label Button contents
 * @property {() => void} [onclick] The onclick event handler
 */
```

## Story Code

```svelte
<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import Button from './Button.svelte'
    import { fn } from 'storybook/test'

    const { Story } = defineMeta({
        title: 'Example/Button',
        component: Button,
        tags: ['autodocs'],
        argTypes: {
            backgroundColor: { control: 'color' },
            size: {
                control: { type: 'select' },
                options: ['small', 'medium', 'large']
            }
        },
        args: {
            onclick: fn()
        }
    })
</script>

<Story name="Primary" args={{ primary: true, label: 'Button' }} />

<Story name="Secondary" args={{ label: 'Button' }} />

<Story name="Large" args={{ size: 'large', label: 'Button' }} />

<Story name="Small" args={{ size: 'small', label: 'Button' }} />
```

## Key Features

1. **Module script** - Uses `<script module>` for story-level configuration
2. **defineMeta** - Configures story metadata (title, component, tags, argTypes)
3. **fn()** - Creates a mock function to track onclick events in tests
4. **autodocs** - Generates automatic documentation page
5. **Multiple variants** - Primary, Secondary, Large, Small states
