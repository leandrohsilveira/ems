<script>
	import { cn } from '../../utils';

	/** @import { InputProps } from '@ems/types-frontend-ui' */

	/** @type {InputProps} */
	let {
		label,
		description,
		error,
		disabled = false,
		class: className,
		type = 'text',
		value = $bindable(''),
		placeholder,
		id,
		...restProps
	} = $props();

	let inputId = $derived(id ?? `input-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label
			for={inputId}
			class="text-sm font-medium leading-[1.4285714285714286] text-foreground"
		>
			{label}
		</label>
	{/if}

	<input
		id={inputId}
		{type}
		{disabled}
		{placeholder}
		bind:value
		class={cn(
			'w-full rounded-full border border-border bg-accent px-6 py-4.5 text-sm text-foreground',
			'placeholder:text-muted-foreground',
			'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
			'disabled:cursor-not-allowed disabled:opacity-50',
			error && 'border-destructive focus:ring-destructive focus:border-destructive',
			className
		)}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={description || error ? `${inputId}-description` : undefined}
		{...restProps}
	/>

	{#if description && !error}
		<p id="{inputId}-description" class="text-sm text-muted-foreground">
			{description}
		</p>
	{/if}

	{#if error}
		<p id="{inputId}-description" class="text-sm text-destructive" role="alert">
			{error}
		</p>
	{/if}
</div>
