<script module>
    import '../../index.css'
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Input from './input.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input',
		component: Input,
		tags: ['autodocs'],
		argTypes: {
			label: { control: 'text' },
			description: { control: 'text' },
			error: { control: 'text' },
			disabled: { control: 'boolean' },
			placeholder: { control: 'text' },
			type: {
				control: { type: 'select' },
				options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
			},
		},
	});
</script>

<Story name="Default" args={{ placeholder: 'Enter text...' }} />

<Story name="With Label" args={{ label: 'Email', placeholder: 'Enter your email' }} />

<Story name="With Description" args={{ label: 'Email', description: 'We will never share your email.', placeholder: 'Enter your email' }} />

<Story name="With Error" args={{ label: 'Email', error: 'Please enter a valid email address', placeholder: 'Enter your email' }} />

<Story name="Disabled" args={{ label: 'Disabled Input', disabled: true, placeholder: 'Cannot edit this' }} />

<Story name="Password" args={{ label: 'Password', type: 'password', placeholder: 'Enter password' }} />

<Story name="Search" args={{ label: 'Search', type: 'search', placeholder: 'Search...' }} />
