<script>
    import Input from '@ems/ui/components/input'
    import Checkbox from '@ems/ui/components/checkbox'
    import Button from '@ems/ui/components/button'
    import Paper from '@ems/ui/components/paper'

    /** @type {import('./types.js').LoginFormProps} */
    let { errors, errorMessage, enhance, action = '/login', signupHref } = $props()

    let loading = $state(false)
    let rememberMe = $state(false)
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
            <h1 class="text-foreground text-center text-2xl font-semibold">Sign In</h1>
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
        aria-label="User login form"
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

        <!-- Password field -->
        <Input
            name="password"
            label="Password"
            placeholder="Enter your password"
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
            label="Remember me"
            disabled={loading}
        />

        <!-- Submit button -->
        <Button type="submit" class="w-full rounded-full" {loading} aria-label="Sign in button"
            >Sign In</Button
        >

        <!-- Signup link -->
        <div class="flex items-center justify-center gap-2">
            <span class="text-muted-foreground text-sm">Don't have an account?</span>
            <a href={signupHref} class="text-primary text-sm font-medium">Create Account</a>
        </div>
    </form>
</Paper>
