<script>
    import { resolve } from '$app/paths'
    import SignupSuccess from '@ems/domain-frontend-auth/components/signup-success'

    const { data } = $props()

    // Resolve login URL
    const loginHref = resolve('/login')
</script>

<svelte:head>
    <title>{data.literals.title}</title>
</svelte:head>

<div class="bg-background flex min-h-screen items-center justify-center p-4">
    <SignupSuccess literals={data.literals} {loginHref} />
</div>
