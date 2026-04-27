<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import Paper from './paper.svelte'
    import PaperHeader from './paper-header.svelte'
    import PaperContent from './paper-content.svelte'
    import PaperFooter from './paper-footer.svelte'

    const { Story } = defineMeta({
        title: 'Components/Paper',
        component: Paper,
        tags: ['autodocs']
    })
</script>

<Story name="Default">
    <p class="text-muted-foreground">This is the card content.</p>
</Story>

<Story name="WithHeader">
    <PaperHeader class="p-10">
        <h3 class="text-lg font-semibold">Card Title</h3>
    </PaperHeader>
    <PaperContent class="p-10 pt-0">
        <p class="text-muted-foreground">This is the card content.</p>
    </PaperContent>
</Story>

<Story name="WithFooter">
    <PaperContent class="p-10">
        <p class="text-muted-foreground">This is the card content.</p>
    </PaperContent>
    <PaperFooter class="flex gap-2 p-10 pt-0">
        <button class="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm"
            >Action</button
        >
        <button class="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm"
            >Cancel</button
        >
    </PaperFooter>
</Story>

<Story name="Full">
    <PaperHeader class="p-10">
        <h3 class="text-lg font-semibold">Card Title</h3>
        <p class="text-muted-foreground text-sm">Card subtitle</p>
    </PaperHeader>
    <PaperContent class="p-10 pt-0">
        <p class="text-muted-foreground">This is the card content.</p>
    </PaperContent>
    <PaperFooter class="flex gap-2 p-10 pt-0">
        <button class="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm"
            >Confirm</button
        >
        <button class="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm"
            >Cancel</button
        >
    </PaperFooter>
</Story>
