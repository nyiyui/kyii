<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { client } from '$lib/api2'
	import { MissingPermsError } from '$lib/api2'
	import Box from '$lib/Box.svelte'
	import { page } from '$app/stores'
	import { getNext } from '$lib/util'
	import { browser } from '$app/env'

	let next

	if (browser) {
		next = getNext($page.url.searchParams)
	}

	enum State {
		Init,
		SignedUp,
		MissingPerms
	}

	let state: State = State.Init
	// TODO: next, selfnext, etc

	async function signup() {
		try {
			await client.signup()
			state = State.SignedUp
			window.navigation.navigate('/config')
		} catch (e) {
			if (e instanceof MissingPermsError) {
				console.log(e)
				state = State.MissingPerms
			} else {
				throw e
			}
		}
	}
</script>

<svelte:head>
	<title>{$_('header.signup')}</title>
</svelte:head>

<main>
	<form id="signup">
		<Box level="info">
			You can choose your name, username, APs, AFs, etc <em>after</em> you create your account.
		</Box>
		<input type="button" disabled={state !== State.Init} on:click={signup} value="Create Account" />
		{#if state === State.SignedUp}
			<a href="/config">Next</a>
		{:else if state === State.MissingPerms}
			<Box level="error">Forbidden (not enough perms).</Box>
			<Box level="info">
				Try <a href="/login">logging in</a> or <a href="/iori/switch">switching</a>.
			</Box>
		{/if}
	</form>
</main>
