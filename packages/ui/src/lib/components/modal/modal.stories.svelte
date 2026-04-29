<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import Modal from './modal.svelte'
    import ModalHeader from './modal-header.svelte'
    import ModalContent from './modal-content.svelte'
    import ModalActions from './modal-actions.svelte'
    import Button from '../button/button.svelte'

    const { Story } = defineMeta({
        title: 'Components/Modal',
        component: Modal,
        tags: ['autodocs'],
        args: {
            label: 'Example dialog'
        }
    })
</script>

<Story name="Default" args={{ open: true }}>
    <ModalHeader>
        <h2 class="text-foreground text-xl font-medium">Modal Title</h2>
        <p class="text-muted-foreground text-sm">This is a subtitle for the modal.</p>
    </ModalHeader>
    <ModalContent>
        <p class="text-muted-foreground">Modal content goes here.</p>
    </ModalContent>
    <ModalActions>
        <Button size="large" class="w-full">Confirm</Button>
        <Button variant="secondary" size="large" class="w-full">Cancel</Button>
    </ModalActions>
</Story>

<Story name="WithHeaderAndContent" args={{ open: true }}>
    <ModalHeader>
        <h2 class="text-foreground text-xl font-medium">Create Account</h2>
        <p class="text-muted-foreground text-sm">Add a new bank account to your ledger.</p>
    </ModalHeader>
    <ModalContent>
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
                <label class="text-foreground text-sm font-medium" for="story-account-name"
                    >Account Name</label
                >
                <input
                    id="story-account-name"
                    class="bg-accent border-input placeholder:text-muted-foreground h-11 w-full rounded-full border px-6 text-sm"
                    placeholder="e.g. Nubank Checking"
                />
            </div>
            <div class="flex flex-col gap-1.5">
                <label class="text-foreground text-sm font-medium" for="story-initial-balance"
                    >Initial Balance</label
                >
                <input
                    id="story-initial-balance"
                    class="bg-accent border-input placeholder:text-muted-foreground h-11 w-full rounded-full border px-6 text-sm"
                    placeholder="0,00"
                />
            </div>
        </div>
    </ModalContent>
    <ModalActions>
        <Button size="large" class="w-full">Create Account</Button>
        <Button variant="secondary" size="large" class="w-full">Cancel</Button>
    </ModalActions>
</Story>

<Story name="Closed">
    <ModalHeader>
        <h2 class="text-foreground text-xl font-medium">Modal Title</h2>
    </ModalHeader>
    <ModalContent>
        <p class="text-muted-foreground">This modal should not be visible.</p>
    </ModalContent>
    <ModalActions>
        <Button>OK</Button>
    </ModalActions>
</Story>
