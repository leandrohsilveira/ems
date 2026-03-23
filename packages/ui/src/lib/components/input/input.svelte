<script>
    /**
     * @import { HTMLInputAttributes } from "svelte/elements"
     */
	import { cn } from '../../utils';

    /** @type {HTMLInputAttributes} */
    let { class: className, ...props } = $props()
</script>

<input
    class={cn("rounded-full border border-solid border-blue-500 px-4 py-2", className)}
    {...props}
/>
