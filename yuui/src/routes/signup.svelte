<script lang="ts" type="module">
	import { Client } from "$lib/api";
	import { apiBaseUrl } from "$lib/store";
	import { browser } from "$app/env";
	import Box from '$lib/Box.svelte';

	let client: Client;

	enum State {
		Init,
		SignedUp,
		MissingPerms,
	}

	let state: State = State.Init;
	// TODO: next, selfnext, etc

	(async () => {
		if (browser) {
			client = new Client($apiBaseUrl);
			// not using export function get in *.ts because it didn't work for moi…maybe a TODO: fix this?
			const s = await client.status();
			if (s !== null) {
				window.location.replace("/");
			}
			console.log('not logged in');
		}
	})();

	async function signup() {
		const uid = await client.signup();
		if (uid === false) {
			console.error('missing perms');
			state = State.MissingPerms;
		} else {
			console.log(`signed up; uid is ${uid}`);
			state = State.SignedUp;
		}
	}
</script>

<svelte:head>
	<title>Signup</title>
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
			<Box level="error">
				Forbidden (not enough perms).
			</Box>
			<Box level="info">
				Try <a href="/login">logging in</a>.
			</Box>
		{/if}
	</form>
</main>
