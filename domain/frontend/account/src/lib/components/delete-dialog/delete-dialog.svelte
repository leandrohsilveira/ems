<script>
    /**
     * @import { DeleteDialogProps } from './types.js'
     */

    import { cn } from '@ems/ui'
    import Modal from '@ems/ui/components/modal'
    import { ModalHeader, ModalActions } from '@ems/ui/components/modal'
    import Button from '@ems/ui/components/button'

    /** @type {DeleteDialogProps} */
    let {
        open,
        accountName,
        literals,
        enhance,
        cancelHref,
        action = '?/delete',
        errorMessage = null,
        loading = $bindable(false),
        class: className = ''
    } = $props()
</script>

<Modal {open}>
    <div class={cn('w-full max-w-sm', className)}>
        <form
            method="POST"
            {action}
            use:enhance={() => {
                loading = true
                return async ({ update }) => {
                    await update()
                    loading = false
                }
            }}
            novalidate
        >
            <ModalHeader>
                <h3 class="text-foreground text-lg font-medium">{literals.title}</h3>
                <p class="text-muted-foreground mt-2 text-sm">
                    {literals.description.replace('{accountName}', accountName)}
                </p>
            </ModalHeader>

            <ModalActions>
                {#if errorMessage}
                    <div
                        class="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-3 text-sm"
                    >
                        {errorMessage}
                    </div>
                {/if}

                <Button
                    type="submit"
                    variant="destructive"
                    size="large"
                    class="w-full"
                    disabled={loading}
                    aria-label={literals.deleteButton}
                >
                    {literals.deleteButton}
                </Button>
                <Button
                    element="a"
                    variant="outline"
                    size="large"
                    class="w-full"
                    disabled={loading}
                    href={cancelHref}
                    aria-label={literals.cancelButton}
                >
                    {literals.cancelButton}
                </Button>
            </ModalActions>
        </form>
    </div>
</Modal>
