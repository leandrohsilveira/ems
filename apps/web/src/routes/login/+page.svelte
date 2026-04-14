<script>
    import { enhance } from '$app/forms'
    import { resolve } from '$app/paths'
    import LoginForm from '@ems/domain-frontend-auth/components/login-form'

    /** @type {import('./$types.js').PageProps} */
    const { form } = $props()

    // Resolve signup URL
    const signupHref = resolve('/signup')
</script>

<svelte:head>
    <title>Login - EMS</title>
</svelte:head>

<div class="bg-background flex min-h-screen items-center justify-center p-4">
    <LoginForm errors={form?.errors} errorMessage={form?.errorMessage} {enhance} {signupHref} />
</div>
