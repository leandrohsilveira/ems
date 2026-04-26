<script>
    import Input from '@ems/ui/components/input'
    import Button from '@ems/ui/components/button'
    import Paper from '@ems/ui/components/paper'
    import Logo from '@ems/domain-frontend-assets/logo.svg?component'

    /** @type {import('./types.js').SignupFormProps} */
    let { literals, errors, errorMessage, enhance, action = '/signup', loginHref } = $props()

    let loading = $state(false)
</script>

<Paper class="flex w-full max-w-105 flex-col gap-4">
    {#snippet header()}
        <!-- Header with logo and title -->
        <div class="flex flex-col items-center gap-4">
            <div class="flex flex-col items-center gap-2">
                <Logo class="text-primary h-24 w-24" />
                <h1 class="text-primary text-lg font-bold">{literals.headerApp}</h1>
            </div>
            <h1 class="text-foreground text-center text-2xl font-semibold">{literals.header}</h1>
        </div>
    {/snippet}

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
        class="flex flex-col gap-4"
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

        <!-- Email field -->
        <Input
            name="email"
            label={literals.emailLabel}
            placeholder={literals.emailPlaceholder}
            required
            type="email"
            autocomplete="email"
            error={errors?.fields.email}
            disabled={loading}
        />

        <!-- First Name field (optional) -->
        <Input
            name="firstName"
            label={literals.firstNameLabel}
            placeholder={literals.firstNamePlaceholder}
            autocomplete="given-name"
            error={errors?.fields.firstName}
            disabled={loading}
        />

        <!-- Last Name field (optional) -->
        <Input
            name="lastName"
            label={literals.lastNameLabel}
            placeholder={literals.lastNamePlaceholder}
            autocomplete="family-name"
            error={errors?.fields.lastName}
            disabled={loading}
        />

        <!-- Password field -->
        <Input
            name="password"
            label={literals.passwordLabel}
            placeholder={literals.passwordPlaceholder}
            required
            type="password"
            autocomplete="new-password"
            error={errors?.fields.password}
            disabled={loading}
        />

        <!-- Confirm Password field -->
        <Input
            name="confirmPassword"
            label={literals.confirmPasswordLabel}
            placeholder={literals.confirmPasswordPlaceholder}
            required
            type="password"
            autocomplete="new-password"
            error={errors?.fields.confirmPassword}
            disabled={loading}
        />

        <!-- Submit button -->
        <Button
            type="submit"
            class="w-full rounded-full"
            {loading}
            aria-label={literals.signUpButtonAria}>{literals.signUpButton}</Button
        >

        <!-- Login link -->
        <div class="flex items-center justify-center gap-2">
            <span class="text-muted-foreground text-sm">{literals.hasAccountText}</span>
            <a href={loginHref} class="text-primary text-sm font-medium">{literals.signInLink}</a>
        </div>
    </form>
</Paper>
