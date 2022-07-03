<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Loading from '$lib/Loading.svelte'
	import OClientView from '$lib/OClient.svelte'
	import BoxError from '$lib/BoxError.svelte'
	import { browser } from '$app/env'
	import { client } from '$lib/api2'
	import type { OClient } from '$lib/api2'

	let oclients: Array<OClient>
	let error = ''
	enum State {
		Loading,
		LoadingError,
		Loaded
	}
	let state: State
	;(async () => {
		if (browser) {
			if (!(await client.loggedIn())) {
				console.log('not logged in')
				window.location.replace('/login')
			}
			await reload()
		}
	})()

	async function reload() {
		console.log('reload')
		state = State.Loading
		try {
			oclients = await client.oclientsList()
			state = State.Loaded
		} catch (e) {
			error = e.message
			state = State.LoadingError
		}
	}

	function new_() {
		oclients.push({
			id: null,
			name: '',
			uri: '',
			grant_types: [],
			redirect_uris: [],
			response_types: [],
			scioe: '',
			token_endpoint_auth_method: '',
			client_id: '',
			client_secret: '',
			client_id_issued_at: '',
			client_secret_expires_at: ''
		})
		oclients = oclients
	}
</script>

<svelte:head>
	<title>{$_('header.oclients')}</title>
</svelte:head>

<main class="oclients">
	<input
		type="button"
		value={$_('oclients.reload')}
		on:click={reload}
		disabled={state === State.Loading}
	/>
	<input
		class="new"
		type="button"
		value={$_('oclients.new')}
		on:click={new_}
		disabled={state === State.Loading}
	/>
	{#if state === State.Loading}
		<Loading />
	{:else if state === State.LoadingError}
		<BoxError msg={error} passive />
	{:else if state === State.Loaded}
		{$_('oclients.count', { values: { count: oclients.length } })}
		{#each oclients as oclient}
			<OClientView {oclient} on:reload={reload} />
		{/each}
	{/if}
</main>
