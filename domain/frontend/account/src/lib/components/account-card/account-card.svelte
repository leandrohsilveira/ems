<script>
    import { cn } from '@ems/ui'
    import Button from '@ems/ui/components/button'
    import PencilIcon from '@ems/icons/pencil.svg?component'
    import TrashIcon from '@ems/icons/trash.svg?component'

    /**
     * @import { AccountCardProps } from "./types.js"
     */

    /** @type {AccountCardProps} */
    let {
        account,
        editHref,
        deleteHref,
        literals,
        locale = 'en',
        tabindex = 0,
        class: className = ''
    } = $props()

    const balanceFormatted = $derived(
        new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: account.currency
        }).format(Number(account.balance))
    )

    const dateFormatted = $derived(
        new Intl.DateTimeFormat(locale).format(new Date(account.createdAt))
    )
</script>

<div
    role="row"
    {tabindex}
    data-testid="account-card"
    class={cn(
        'bg-card border-border hover:bg-accent/5 flex w-full flex-col gap-2.5 rounded-xl border px-4 py-3.5 shadow-sm transition-colors md:flex-row md:items-center md:gap-4 md:px-6 md:py-5',
        className
    )}
>
    <div class="flex flex-1 flex-col gap-2.5 md:flex-row md:items-center md:gap-4">
        <div class="min-w-0 flex-1">
            <p class="text-foreground truncate text-base font-medium">{account.name}</p>
            <p class="text-muted-foreground text-xs">{literals.bankAccountLabel}</p>
        </div>

        <div class="hidden flex-1 md:flex md:items-center md:gap-4">
            <div class="w-40 shrink-0 text-right">
                <p class="text-foreground text-lg font-semibold">{balanceFormatted}</p>
                <p class="text-muted-foreground text-xs">{literals.balanceLabel}</p>
            </div>

            <div class="w-28 shrink-0 text-right">
                <p class="text-foreground text-sm">{dateFormatted}</p>
                <p class="text-muted-foreground text-xs">{literals.createdLabel}</p>
            </div>
        </div>
    </div>

    <div class="flex items-center justify-between md:w-24 md:justify-end md:gap-1">
        <div class="flex-1 md:hidden">
            <p class="text-foreground text-xl font-semibold">{balanceFormatted}</p>
            <p class="text-muted-foreground text-xs">{dateFormatted}</p>
        </div>

        <div
            class="flex items-center gap-1"
            role="group"
            aria-label={literals.editAriaLabel + ', ' + literals.deleteAriaLabel}
        >
            <Button
                element="a"
                href={editHref}
                size="icon"
                aria-label={literals.editAriaLabel}
                data-testid="edit-button"
            >
                <PencilIcon />
            </Button>

            <Button
                element="a"
                href={deleteHref}
                size="icon"
                variant="destructive"
                aria-label={literals.deleteAriaLabel}
                data-testid="delete-button"
            >
                <TrashIcon />
            </Button>
        </div>
    </div>
</div>
