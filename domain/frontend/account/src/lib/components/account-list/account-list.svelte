<script>
    import { formatMessage } from '@ems/utils'
    import { cn } from '@ems/ui'
    import Button from '@ems/ui/components/button'
    import PlusIcon from '@ems/icons/plus-lg.svg?component'
    import AccountCard from '../account-card/account-card.svelte'

    /**
     * @import { AccountListProps } from "./types.js"
     */

    /** @type {AccountListProps} */
    let {
        accounts,
        literals,
        loading = false,
        createHref,
        editHref,
        deleteHref,
        class: className = ''
    } = $props()
</script>

<div
    data-testid="account-list"
    role="table"
    aria-label={literals.accountList}
    class={cn('flex flex-col gap-3', className)}
>
    {#if loading}
        <div data-testid="loading-skeleton" class="flex flex-col gap-3">
            {#each [1, 2, 3] as _, i (i)}
                <div class="bg-card border-border w-full animate-pulse rounded-xl border px-6 py-5">
                    <div class="flex items-center gap-4">
                        <div class="flex-1 space-y-2">
                            <div class="bg-accent h-4 w-1/3 rounded"></div>
                            <div class="bg-accent h-3 w-1/6 rounded"></div>
                        </div>
                        <div class="w-40 space-y-2">
                            <div class="bg-accent ml-auto h-4 w-3/4 rounded"></div>
                            <div class="bg-accent ml-auto h-3 w-1/2 rounded"></div>
                        </div>
                        <div class="w-28 space-y-2">
                            <div class="bg-accent ml-auto h-3 w-2/3 rounded"></div>
                            <div class="bg-accent ml-auto h-3 w-1/2 rounded"></div>
                        </div>
                        <div class="flex w-24 gap-2">
                            <div class="bg-accent h-10 w-10 rounded-full"></div>
                            <div class="bg-accent h-10 w-10 rounded-full"></div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else if accounts.length === 0}
        <div class="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p class="text-foreground text-lg font-medium">{literals.emptyTitle}</p>
            <p class="text-muted-foreground max-w-sm text-sm">{literals.emptyDescription}</p>
            <Button element="a" href={createHref} variant="default">
                <PlusIcon />
                {literals.newAccountButton}
            </Button>
        </div>
    {:else}
        {#each accounts as account (account.id)}
            <AccountCard
                {account}
                literals={literals.accountCard}
                editHref={formatMessage(editHref, { id: account.id })}
                deleteHref={formatMessage(deleteHref, { id: account.id })}
            />
        {/each}
    {/if}
</div>
