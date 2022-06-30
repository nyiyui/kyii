<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { client, ulos, currentUlid } from '$lib/api2'
	import { MissingPermsError } from '$lib/api2'
	import Box from '$lib/Box.svelte'
	import IdInput from '$lib/id/IdInput.svelte'
	import { page } from '$app/stores'
	import { getNext } from '$lib/util'
	import { browser } from '$app/env'
	import { onMount } from 'svelte'

	// TODO: let the user configure name, slug, etc here so it's a bit more familliar

	let next
	let ok = false

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
			ok = true
		} catch (e) {
			if (e instanceof MissingPermsError) {
				console.log(e)
				state = State.MissingPerms
			} else {
				throw e
			}
		}
	}

	onMount(async () => {
		if ($currentUlid === "anonymous") {
			signup()
		}
		if ($ulos.get($currentUlid).slug !== null) {
			ok = true
		}
	})
</script>

<svelte:head>
	<title>{$_('header.signup')}</title>
</svelte:head>

<main>
	{#if ok}
		<form id="signup">
			<input type="button" disabled={state !== State.Init} on:click={signup} value="Create New Account" />
			<Box level="info">
				You can choose your name, username, APs, AFs, etc <em>after</em> you create your account.
			</Box>
			{#if state === State.SignedUp}
				<a href="/config">Next</a>
			{:else if state === State.MissingPerms}
				<Box level="error">Forbidden (not enough perms).</Box>
				<Box level="info">
					Try <a href="/login">logging in</a> or <a href="/iori/switch">switching</a>.
				</Box>
			{/if}
		</form>
	{:else}
		<IdInput />
	{/if}
</main>
