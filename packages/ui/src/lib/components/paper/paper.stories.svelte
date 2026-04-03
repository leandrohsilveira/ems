<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf'
    import Paper from './paper.svelte'

    const { Story } = defineMeta({
        title: 'Components/Paper',
        component: Paper,
        tags: ['autodocs']
    })
</script>

<Story name="Default">
    <Paper>
        <p class="text-muted-foreground">This is the card content.</p>
    </Paper>
</Story>

<Story name="WithHeader">
    <Paper>
        {#snippet header()}
            <h3 class="text-lg font-semibold">Card Title</h3>
        {/snippet}
        <p class="text-muted-foreground">This is the card content.</p>
    </Paper>
</Story>

<Story name="WithFooter">
    <Paper>
        <p class="text-muted-foreground">This is the card content.</p>
        {#snippet footer()}
            <div class="flex gap-2">
                <button class="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm"
                    >Action</button
                >
                <button
                    class="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm"
                    >Cancel</button
                >
            </div>
        {/snippet}
    </Paper>
</Story>

<Story name="Full">
    <Paper>
        {#snippet header()}
            <h3 class="text-lg font-semibold">Card Title</h3>
            <p class="text-muted-foreground text-sm">Card subtitle</p>
        {/snippet}
        <p class="text-muted-foreground">This is the card content.</p>
        {#snippet footer()}
            <div class="flex gap-2">
                <button class="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm"
                    >Confirm</button
                >
                <button
                    class="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm"
                    >Cancel</button
                >
            </div>
        {/snippet}
    </Paper>
</Story>
