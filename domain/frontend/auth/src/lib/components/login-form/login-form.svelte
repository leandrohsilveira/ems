<script>
    import Input from '@ems/ui/components/input'
    import Checkbox from '@ems/ui/components/checkbox'
    import Button from '@ems/ui/components/button'
    import Paper from '@ems/ui/components/paper'
    import { PaperHeader } from '@ems/ui/components/paper'
    import Logo from '@ems/domain-frontend-assets/logo.svg?component'

    /** @type {import('./types.js').LoginFormProps} */
    let { literals, errors, errorMessage, enhance, action = '/login', signupHref } = $props()

    let loading = $state(false)
    let rememberMe = $state(false)
</script>

<Paper class="flex w-full max-w-105 flex-col">
    <PaperHeader class="flex flex-col items-center gap-4 p-10 pb-0">
        <!-- Header with logo and title -->
        <div class="flex flex-col items-center gap-2">
            <Logo class="text-primary h-24 w-24" />
            <h1 class="text-primary text-lg font-bold">{literals.headerApp}</h1>
        </div>
        <h2 class="text-foreground text-center text-2xl font-semibold">{literals.header}</h2>
    </PaperHeader>

    <!-- Form -->
    <form
        method="POST"
        {action}
        use:enhance={() => {
            loading = true
            // Clear previous errors on new submission
            errorMessage = undefined
            errors = { fields: {} }
            return async ({ update }) => {
                await update()
                loading = false
            }
        }}
        class="flex flex-col gap-4 p-10 pt-0"
        aria-label={literals.formAriaLabel}
        novalidate
    >
        <!-- Error message display -->
        {#if errorMessage}
            <div
                class="bg-destructive/10 border-destructive text-destructive rounded-lg border p-3 text-sm"
            >
                {errorMessage}
            </div>
        {/if}

        <!-- Username field -->
        <Input
            name="username"
            label={literals.usernameLabel}
            placeholder={literals.usernamePlaceholder}
            required
            autocomplete="username"
            error={errors?.fields.username}
            disabled={loading}
        />

        <!-- Password field -->
        <Input
            name="password"
            label={literals.passwordLabel}
            placeholder={literals.passwordPlaceholder}
            required
            type="password"
            autocomplete="current-password"
            error={errors?.fields.password}
            disabled={loading}
        />

        <!-- Remember me checkbox -->
        <Checkbox
            name="rememberMe"
            bind:checked={rememberMe}
            label={literals.rememberMeLabel}
            disabled={loading}
        />

        <!-- Submit button -->
        <Button
            type="submit"
            class="w-full rounded-full"
            {loading}
            aria-label={literals.signInButtonAria}>{literals.signInButton}</Button
        >

        <!-- Signup link -->
        <div class="flex items-center justify-center gap-2">
            <span class="text-muted-foreground text-sm">{literals.noAccountText}</span>
            <a href={signupHref} class="text-primary text-sm font-medium"
                >{literals.createAccountLink}</a
            >
        </div>
    </form>
</Paper>
