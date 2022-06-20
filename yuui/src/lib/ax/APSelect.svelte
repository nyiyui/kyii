<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Select from 'svelte-select'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let aps
	export let chosen

	let items: Array<{ value: string; label: string }>
	let value: { value: string; label: string }

	$: items = aps.map((ap) => ({ value: ap.uuid, label: ap.name }))

	function choose() {
		console.log('choose', chosen)
		chosen = value.value
		dispatch('choose')
	}
</script>

<div class="ap-select">
	<Select {items} bind:value on:select={choose} placeholder={$_('ap_select.placeholder')} />
</div>

<style>
	.ap-select {
		--background: var(--color-bg);
		--color: var(--color-fg);
		--border: 1px solid var(--color-2);
		--borderRadius: 8px;
		--padding: 6px;
		--margin: 2px;
	}
</style>
