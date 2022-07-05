<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import type { OClient } from '$lib/api2'
	import BoxError from '$lib/BoxError.svelte'
	import Loading from '$lib/Loading.svelte'
	import OClientView from '$lib/OClientView.svelte'
	import { client, forceLogin } from '$lib/api2'
	import { onMount } from 'svelte'
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

	onMount(async () => {
		await forceLogin()
		reload()
	})

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
