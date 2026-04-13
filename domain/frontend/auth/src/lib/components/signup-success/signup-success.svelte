<script>
    import Paper from '@ems/ui/components/paper'
    import CheckCircleFill from '@ems/icons/check-circle-fill.svg?component'

    /** @type {import('./types.js').SignupSuccessProps} */
    let { loginHref } = $props()
</script>

<Paper class="w-full max-w-[420px] p-6 text-center" testId="signup-success-paper">
    <!-- Success icon with currentColor inheritance -->
    <CheckCircleFill
        class="text-success mx-auto mb-4 h-12 w-12"
        aria-label="Success icon"
        role="img"
    />

    <!-- Title -->
    <h1 class="text-foreground mb-4 text-2xl font-semibold">Sign Up Successful</h1>

    <!-- Success message -->
    <p class="text-muted-foreground mb-4">Your account has been created successfully.</p>

    <!-- Email verification message -->
    <p class="text-muted-foreground mb-6">
        Please check your email to click the verification link.
    </p>

    <!-- Login link -->
    <a href={loginHref} class="text-primary font-medium">Go to Login</a>
</Paper>
