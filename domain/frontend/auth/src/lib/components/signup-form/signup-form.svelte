<script>
    import Input from '@ems/ui/components/input'
    import Button from '@ems/ui/components/button'
    import Paper from '@ems/ui/components/paper'

    /** @import { FormEnhancerAction } from '@ems/types-frontend-ui' */
    /** @import { ValidationErrorDTO } from '@ems/domain-shared-schema' */

    /**
     * @exports @typedef SignupFormProps
     * @property {FormEnhancerAction} enhance
     * @property {string} loginHref
     * @property {ValidationErrorDTO} [errors]
     * @property {string} [errorMessage]
     * @property {string} [action]
     */

    /** @type {SignupFormProps} */
    let { errors, errorMessage, enhance, action = '/signup', loginHref } = $props()

    let loading = $state(false)
</script>

<Paper class="flex w-full max-w-[420px] flex-col gap-4">
    {#snippet header()}
        <!-- Header with logo and title -->
        <div class="flex flex-col items-center gap-4">
            <div
                class="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full font-semibold"
            >
                EMS
            </div>
            <h1 class="text-foreground text-center text-2xl font-semibold">Create Account</h1>
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
        aria-label="User sign-up form"
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
            label="Username"
            placeholder="Enter your username"
            required
            autocomplete="username"
            error={errors?.fields.username}
            disabled={loading}
        />

        <!-- Email field -->
        <Input
            name="email"
            label="Email"
            placeholder="Enter your email"
            required
            type="email"
            autocomplete="email"
            error={errors?.fields.email}
            disabled={loading}
        />

        <!-- First Name field (optional) -->
        <Input
            name="firstName"
            label="First Name (Optional)"
            placeholder="Enter your first name"
            autocomplete="given-name"
            error={errors?.fields.firstName}
            disabled={loading}
        />

        <!-- Last Name field (optional) -->
        <Input
            name="lastName"
            label="Last Name (Optional)"
            placeholder="Enter your last name"
            autocomplete="family-name"
            error={errors?.fields.lastName}
            disabled={loading}
        />

        <!-- Password field -->
        <Input
            name="password"
            label="Password"
            placeholder="Enter your password"
            required
            type="password"
            autocomplete="new-password"
            error={errors?.fields.password}
            disabled={loading}
        />

        <!-- Confirm Password field -->
        <Input
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            required
            type="password"
            autocomplete="new-password"
            error={errors?.fields.confirmPassword}
            disabled={loading}
        />

        <!-- Submit button -->
        <Button type="submit" class="w-full rounded-full" {loading} aria-label="Signup button"
            >Sign Up</Button
        >

        <!-- Login link -->
        <div class="flex items-center justify-center gap-2">
            <span class="text-muted-foreground text-sm">Already have an account?</span>
            <a href={loginHref} class="text-primary text-sm font-medium">Sign In</a>
        </div>
    </form>
</Paper>
