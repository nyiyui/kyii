<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Loading from '$lib/Loading.svelte'
	import LogEntryView from '$lib/LogEntry.svelte'
	import BoxError from '$lib/BoxError.svelte'
	import { client, forceLogin } from '$lib/api2'
	import type { LogEntry } from '$lib/api2'
	import { onMount } from 'svelte'

	let les: Array<LogEntry>
	let error = ''
	enum State {
		Loading,
		LoadingError,
		Loaded
	}
	let state: State

	onMount(async () => {
		await forceLogin()
		reload()
	})

	async function reload() {
		state = State.Loading
		try {
			les = await client.logList()
			state = State.Loaded
		} catch (e) {
			error = e.message
			state = State.LoadingError
		}
	}
</script>

<svelte:head>
	<title>{$_('header.les')}</title>
</svelte:head>

<main class="les">
	<input
		type="button"
		value={$_('les.reload')}
		on:click={reload}
		disabled={state === State.Loading}
	/>
	{#if state === State.Loading}
		<Loading />
	{:else if state === State.LoadingError}
		<BoxError msg={error} passive />
	{:else if state === State.Loaded}
		{$_('les.count', { values: { count: les.length } })}
		{#each les as le}
			<LogEntryView {le} />
		{/each}
	{/if}
</main>
