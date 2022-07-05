<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Loading from '$lib/Loading.svelte'
	import GrantView from '$lib/Grant.svelte'
	import BoxError from '$lib/BoxError.svelte'
	import { onMount } from 'svelte'
	import { client, forceLogin } from '$lib/api2'
	import type { Grant } from '$lib/api2'

	let grants: Array<Grant>
	let error = ''
	enum State {
		Loading,
		LoadingError,
		Loaded
	}
	let state: State

	onMount(async () => {
		await forceLogin()
		await reload()
	})

	async function reload() {
		console.log('reload')
		state = State.Loading
		try {
			grants = await client.grantsList()
			state = State.Loaded
		} catch (e) {
			error = e.message
			state = State.LoadingError
		}
	}
</script>

<main class="grants">
	<input type="button" value="Reload" on:click={reload} disabled={state === State.Loading} />
	{#if state === State.Loading}
		<Loading />
	{:else if state === State.LoadingError}
		<BoxError msg={error} passive />
	{:else if state === State.Loaded}
		{$_('grants.count', { values: { count: grants.length } })}
		{#each grants as grant}
			<GrantView {grant} on:reload={reload} />
		{/each}
	{/if}
</main>
