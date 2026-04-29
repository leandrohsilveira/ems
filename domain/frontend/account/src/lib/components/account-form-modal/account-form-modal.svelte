<script>
    import { cn } from '@ems/ui'
    import Modal from '@ems/ui/components/modal'
    import { ModalHeader, ModalContent, ModalActions } from '@ems/ui/components/modal'
    import Input from '@ems/ui/components/input'
    import InputNumeric from '@ems/ui/components/input-numeric'
    import Button from '@ems/ui/components/button'

    /** @type {import('./types.js').AccountFormModalProps} */
    let {
        open = $bindable(false),
        mode,
        account,
        literals,
        enhance,
        action,
        errors,
        errorMessage,
        cancelHref,
        loading = $bindable(false),
        class: className = '',
        onclose
    } = $props()
</script>

<Modal bind:open {onclose} class={cn('w-full', className)}>
    <form
        method="POST"
        action={action ?? (mode === 'create' ? '?/create' : '?/update')}
        use:enhance={() => {
            loading = true
            errors = { fields: {} }
            errorMessage = null
            return async ({ update }) => {
                loading = false
                await update()
            }
        }}
        novalidate
    >
        <ModalHeader>
            <h2 class="text-foreground text-xl font-medium">{literals.title}</h2>
            <p class="text-muted-foreground mt-1 text-sm">{literals.subtitle}</p>
        </ModalHeader>

        <ModalContent>
            {#if errorMessage}
                <div
                    class="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-3 text-sm"
                >
                    {errorMessage}
                </div>
            {/if}

            <div class="flex flex-col gap-4">
                {#if mode === 'edit' && account}
                    <input type="hidden" name="accountId" value={account.id} />
                {/if}

                <Input
                    name="name"
                    label={literals.nameLabel}
                    placeholder={literals.namePlaceholder}
                    value={mode === 'edit' && account ? account.name : ''}
                    error={errors?.fields?.name}
                    disabled={loading}
                    required
                />

                {#if mode === 'create'}
                    <InputNumeric
                        name="initialBalance"
                        label={literals.balanceLabel}
                        placeholder={literals.balancePlaceholder}
                        format={{ style: 'currency', currency: 'BRL' }}
                        locale="pt-BR"
                        error={errors?.fields?.initialBalance}
                        disabled={loading}
                    />
                {/if}
            </div>
        </ModalContent>

        <ModalActions>
            <div class="flex flex-col gap-3">
                <Button
                    type="submit"
                    variant="default"
                    size="large"
                    class="w-full"
                    disabled={loading}
                    aria-label={literals.submitButton}
                >
                    {literals.submitButton}
                </Button>
                <Button
                    element="a"
                    variant="secondary"
                    size="large"
                    class="w-full"
                    disabled={loading}
                    href={cancelHref}
                    aria-label={literals.cancelButton}
                >
                    {literals.cancelButton}
                </Button>
            </div>
        </ModalActions>
    </form>
</Modal>
