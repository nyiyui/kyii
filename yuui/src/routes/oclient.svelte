<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import type { OClient } from '$lib/api2'
	import BoxError from '$lib/BoxError.svelte'
	import Loading from '$lib/Loading.svelte'
	import OClientView from '$lib/OClientView.svelte'
	import { client } from '$lib/api2'
	import { browser } from '$app/env'
	import { page } from '$app/stores'

	enum State {
		Loading,
		LoadingError,
		Loaded
	}
	let state: State

	let params: URLSearchParams
	let oclid: string
	if (browser) {
		params = $page.url.searchParams
		oclid = params.get('oclid')
	}

	let ocl: OClient
	let error: string

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
			ocl = await client.oclient(oclid)
			state = State.Loaded
		} catch (e) {
			error = e.message
			state = State.LoadingError
		}
	}
</script>

<svelte:head>
	{#if ocl}
		<title>{$_({ id: 'oclient.title', values: { name: ocl.name } })}</title>
	{/if}
</svelte:head>

<main>
	{#if state === State.Loading}
		<Loading />
	{:else if state === State.LoadingError}
		<BoxError msg={error} passive />
	{:else if state === State.Loaded}
		<OClientView {ocl} />
	{/if}
</main>
