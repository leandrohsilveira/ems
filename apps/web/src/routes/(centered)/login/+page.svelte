<script>
    import { enhance } from '$app/forms'
    import { resolve } from '$app/paths'
    import LoginForm from '@ems/domain-frontend-auth/components/login-form'

    /** @type {import('./$types.js').PageProps} */
    const { form, data } = $props()

    // Resolve signup URL
    const signupHref = resolve('/signup')
</script>

<svelte:head>
    <title>{data.literals.title}</title>
</svelte:head>

<LoginForm
    literals={data.literals}
    errors={form?.errors}
    errorMessage={form?.errorMessage}
    {enhance}
    {signupHref}
/>
