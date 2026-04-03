<script>
    import { resolve } from '$app/paths'
    import SignupSuccess from '@ems/domain-frontend-auth/components/signup-success'

    // Resolve login URL
    const loginHref = resolve('/login')
</script>

<svelte:head>
    <title>Sign Up Successful - EMS</title>
</svelte:head>

<div class="bg-background flex min-h-screen items-center justify-center p-4">
    <SignupSuccess {loginHref} />
</div>
