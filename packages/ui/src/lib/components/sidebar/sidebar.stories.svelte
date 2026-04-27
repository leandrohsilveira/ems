<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import Sidebar from './sidebar.svelte'
    import SidebarHeader from './sidebar-header.svelte'
    import SidebarContent from './sidebar-content.svelte'
    import SidebarFooter from './sidebar-footer.svelte'
    import SidebarItem from './sidebar-item.svelte'

    const { Story } = defineMeta({
        title: 'Components/Sidebar',
        component: Sidebar,
        tags: ['autodocs']
    })
</script>

<Story name="Default">
    <SidebarHeader class="flex items-center gap-2">
        <div
            class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
        >
            E
        </div>
        <span class="text-foreground text-lg font-semibold">EMS</span>
    </SidebarHeader>
    <SidebarContent>
        <SidebarItem label="Dashboard" onclick={() => {}} />
        <SidebarItem label="Accounts" active={true} onclick={() => {}} />
        <SidebarItem label="Transactions" onclick={() => {}} />
        <SidebarItem label="Categories" onclick={() => {}} />
        <SidebarItem label="Reports" onclick={() => {}} />
    </SidebarContent>
    <SidebarFooter class="border-border flex items-center gap-2 border-t">
        <div class="flex-1">
            <p class="text-foreground text-sm font-semibold">Joe Doe</p>
            <p class="text-muted-foreground text-sm">joe@acmecorp.com</p>
        </div>
    </SidebarFooter>
</Story>

<Story name="WithActiveItem">
    <SidebarHeader class="flex items-center gap-2">
        <div
            class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
        >
            E
        </div>
        <span class="text-foreground text-lg font-semibold">EMS</span>
    </SidebarHeader>
    <SidebarContent>
        <SidebarItem label="Dashboard" onclick={() => {}} />
        <SidebarItem label="Accounts" active={true} onclick={() => {}} />
        <SidebarItem label="Transactions" onclick={() => {}} />
    </SidebarContent>
    <SidebarFooter class="border-border border-t">
        <p class="text-muted-foreground text-sm">Logged in as Admin</p>
    </SidebarFooter>
</Story>
