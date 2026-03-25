<script>
    import { enhance } from '$app/forms'
    import Input from '@ems/ui/components/input'
    import Checkbox from '@ems/ui/components/checkbox'
    import Button from '@ems/ui/components/button'
    import Paper from '@ems/ui/components/paper'

    const { form } = $props()

    let loading = $state(false)
    let rememberMe = $state(false)
</script>

<svelte:head>
    <title>Login - EMS</title>
</svelte:head>

<div class="bg-background flex min-h-screen items-center justify-center p-4">
    <Paper class="w-[420px]">
        {#snippet header()}
            <div class="flex flex-col items-center gap-4">
                <div
                    class="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full font-semibold"
                >
                    EMS
                </div>
                <h1 class="text-foreground text-center text-2xl font-semibold">EMS</h1>
            </div>
        {/snippet}

        <form
            method="POST"
            use:enhance={() => {
                loading = true
                return async ({ update }) => {
                    await update()
                    loading = false
                }
            }}
            class="flex flex-col gap-4"
        >
            {#if form?.error}
                <div
                    class="bg-destructive/10 border-destructive text-destructive rounded-lg border p-3 text-sm"
                >
                    {form.error}
                </div>
            {/if}

            <Input
                name="username"
                label="Username"
                placeholder="Enter your username"
                required
                autocomplete="username"
            />

            <Input
                name="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
            />

            <Checkbox bind:checked={rememberMe} label="Remember me" />

            <Button type="submit" class="h-12 w-full" {loading}>Sign In</Button>
        </form>
    </Paper>
</div>
