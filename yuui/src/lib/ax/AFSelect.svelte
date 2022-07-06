<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Select from 'svelte-select'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	type Item = { value: string; label: string }
	function item(verifier: string): Item {
		return { value: verifier, label: $_(`af.${verifier}.label`) }
	}

	const items: Item[] = ['pw', 'otp_totp', 'webauthn', 'limited', 'remote'].map(item)
	export let chosen: string

	let value: Item = item(chosen)

	function choose() {
		chosen = value.value
		dispatch('choose')
	}
</script>

<div class="ap-select">
	<Select {items} bind:value on:select={choose} placeholder={$_('af_select.placeholder')} />
</div>
