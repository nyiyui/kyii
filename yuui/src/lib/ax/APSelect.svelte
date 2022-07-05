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
		chosen = value.value
		dispatch('choose')
	}
</script>

<div class="ap-select">
	<Select {items} bind:value on:select={choose} placeholder={$_('ap_select.placeholder')} />
</div>
