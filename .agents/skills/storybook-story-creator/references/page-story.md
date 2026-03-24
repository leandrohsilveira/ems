# Page Story - Interactive Testing with Play Functions

Example of a Storybook story that uses play functions to test user interactions.

## Features

- Interactive stories with userEvent
- Play functions for testing workflows
- Integration with storybook/test utilities
- Fullscreen layout

## Story Code

```svelte
<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import { expect, userEvent, waitFor, within } from 'storybook/test'
    import Page from './Page.svelte'

    const { Story } = defineMeta({
        title: 'Example/Page',
        component: Page,
        parameters: {
            layout: 'fullscreen'
        }
    })
</script>

<Story
    name="Logged In"
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const loginButton = canvas.getByRole('button', { name: /Log in/i })
        await expect(loginButton).toBeInTheDocument()
        await userEvent.click(loginButton)
        await waitFor(() => expect(loginButton).not.toBeInTheDocument())

        const logoutButton = canvas.getByRole('button', { name: /Log out/i })
        await expect(logoutButton).toBeInTheDocument()
    }}
/>

<Story name="Logged Out" />
```

## Key Features

1. **Play functions** - Auto-run code when story loads to simulate user interactions
2. **Testing utilities** - Import from `storybook/test`:
   - `expect` - Assertion functions
   - `userEvent` - Simulate keyboard/mouse interactions
   - `waitFor` - Wait for async conditions
   - `within` - Scope queries to a specific element

3. **Interaction testing** - Story verifies that clicking "Log in" shows "Log out"
4. **Regex selectors** - `{ name: /Log in/i }` matches localized text

## When to Use

Use play functions for:

- Form validation testing
- User flow verification
- Component state transitions
- Accessibility testing with role queries

## Common Play Patterns

```javascript
// Click a button
await userEvent.click(canvas.getByRole("button", { name: "Submit" }));

// Type in input
await userEvent.type(canvas.getByRole("textbox"), "Hello World");

// Select from dropdown
await userEvent.selectOptions(canvas.getByRole("combobox"), "Option 1");

// Verify element exists
await expect(canvas.getByText("Success")).toBeInTheDocument();

// Wait for async state change
await waitFor(() =>
  expect(canvas.getByText("Loading")).not.toBeInTheDocument(),
);
```
