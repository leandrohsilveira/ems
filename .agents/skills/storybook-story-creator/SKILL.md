---
name: storybook-story-creator
description: Create Storybook stories for Svelte components using @storybook/addon-svelte-csf. Use when asked to "create a story", "add storybook story", "write stories for component", or "document component in storybook".
triggers:
  - "create a story"
  - "add storybook story"
  - "write story"
  - "storybook story"
  - "document component"
---

# Storybook Story Creator

Create Storybook stories using the CSF (Component Story Format) with Svelte.

## Important: Story Location

**Stories must be in the same folder as the component**, not in a central `stories/` folder.

```
packages/ui/src/lib/components/
├── Button/
│   ├── Button.svelte
│   ├── Button.stories.svelte  ✅ Same folder
│   └── index.js
```

## Workflow

1. **Locate the component** you need to create a story for
2. **Analyze the component props** - check JSDoc typedef for props and events
3. **Create the story file** - `<ComponentName>.stories.svelte` in the same folder
4. **Define metadata** with `defineMeta` - title, component, tags, argTypes, args
5. **Add story variants** - create different states (Primary, Secondary, Disabled, etc.)

## Template

```svelte
<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import ComponentName from './ComponentName.svelte'
    import { fn } from 'storybook/test'

    const { Story } = defineMeta({
        title: 'Category/ComponentName',
        component: ComponentName,
        tags: ['autodocs'],
        argTypes: {
            // Controls for props
            propName: {
                control: { type: 'select' },
                options: ['option1', 'option2']
            },
            booleanProp: { control: 'boolean' },
            colorProp: { control: 'color' }
        },
        args: {
            // Default values and event handlers
            onclick: fn()
        }
    })
</script>

<Story name="VariantName" args={{ propName: 'value', label: 'Button' }} />

<Story name="AnotherVariant" args={{ propName: 'other', disabled: true }} />
```

## Key Patterns

### Controls for Props

| Prop Type | Control                                            |
| --------- | -------------------------------------------------- |
| string    | `control: 'text'`                                  |
| boolean   | `control: 'boolean'`                               |
| color     | `control: 'color'`                                 |
| select    | `control: { type: 'select' }, options: ['a', 'b']` |

### Event Handlers

Use `fn()` from `storybook/test` to track events:

```javascript
args: {
    onclick: fn(),
    onChange: fn()
}
```

### Layout Parameter

For components that need full viewport (headers, pages):

```javascript
parameters: {
  layout: "fullscreen";
}
```

### Play Functions

For interactive stories with testing:

```javascript
import { expect, userEvent, waitFor, within } from "storybook/test";

<Story
  name="Interactive"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByText("Updated")).toBeInTheDocument();
  }}
/>;
```

## Title Convention

Use category/component format:

- `Example/Button` - from ui package
- `Form/Input` - form components
- `Layout/Sidebar` - layout components

## References

- [Storybook Svelte CSF](references/button-story.md)
- [Component with State](references/header-story.md)
- [Play Function Testing](references/page-story.md)
