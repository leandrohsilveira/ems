<script>
    import Paper from '@ems/ui/components/paper'
    import CheckCircleFill from '@ems/icons/check-circle-fill.svg?component'

    /** @type {import('./types.js').SignupSuccessProps} */
    let { literals, loginHref } = $props()
</script>

<Paper class="w-full max-w-[420px] p-6 text-center" testId="signup-success-paper">
    <!-- Success icon with currentColor inheritance -->
    <CheckCircleFill
        class="text-success mx-auto mb-4 h-12 w-12"
        aria-label={literals.successIconAria}
        role="img"
    />

    <!-- Title -->
    <h1 class="text-foreground mb-4 text-2xl font-semibold">{literals.header}</h1>

    <!-- Success message -->
    <p class="text-muted-foreground mb-4">{literals.successMessage}</p>

    <!-- Email verification message -->
    <p class="text-muted-foreground mb-6">
        {literals.emailVerificationMessage}
    </p>

    <!-- Login link -->
    <a href={loginHref} class="text-primary font-medium">{literals.loginLink}</a>
</Paper>
