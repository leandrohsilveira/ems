<script>
    import { resolve } from '$app/paths'
    import CenteredLayout from '@ems/ui/components/centered-layout'
    import SignupSuccess from '@ems/domain-frontend-auth/components/signup-success'

    const { data } = $props()

    // Resolve login URL
    const loginHref = resolve('/login')
</script>

<svelte:head>
    <title>{data.literals.title}</title>
</svelte:head>

<CenteredLayout>
    <SignupSuccess literals={data.literals} {loginHref} />
</CenteredLayout>
