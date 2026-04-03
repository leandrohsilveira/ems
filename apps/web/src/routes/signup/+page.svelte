<script>
    import { enhance } from '$app/forms'
    import { resolve } from '$app/paths'
    import SignupForm from '@ems/domain-frontend-auth/components/signup-form'

    /** @type {import('./$types.js').PageProps} */
    const { form } = $props()

    // Resolve login URL
    const loginHref = resolve('/login')
</script>

<svelte:head>
    <title>Sign Up - EMS</title>
</svelte:head>

<div class="bg-background flex min-h-screen items-center justify-center p-4">
    <SignupForm errors={form?.errors} errorMessage={form?.errorMessage} {enhance} {loginHref} />
</div>
