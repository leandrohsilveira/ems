<script>
    import { enhance } from '$app/forms'
    import { resolve } from '$app/paths'
    import CenteredLayout from '@ems/ui/components/centered-layout'
    import SignupForm from '@ems/domain-frontend-auth/components/signup-form'

    /** @type {import('./$types.js').PageProps} */
    const { form, data } = $props()

    // Resolve login URL
    const loginHref = resolve('/login')
</script>

<svelte:head>
    <title>{data.literals.title}</title>
</svelte:head>

<CenteredLayout>
    <SignupForm
        literals={data.literals}
        errors={form?.errors}
        errorMessage={form?.errorMessage}
        {enhance}
        {loginHref}
    />
</CenteredLayout>
