<script lang="ts" type="module">
	import { client } from "$lib/api2";
	import { MissingPermsError } from "$lib/api2";
	import { browser } from "$app/env";
	import Box from '$lib/Box.svelte';

	enum State {
		Init,
		SignedUp,
		MissingPerms,
	}

	let state: State = State.Init;
	// TODO: next, selfnext, etc

	(async () => {
		if (browser) {
			// not using export function get in *.ts because it didn't work for moi…maybe a TODO: fix this?
			const s = await client.status();
			if (s !== null) {
				window.location.replace("/");
			}
			console.log('not logged in');
		}
	})();

	async function signup() {
		try {
			await client.signup();
			state = State.SignedUp;
		}	catch (e) {
			if (e instanceof MissingPermsError) {
				console.log(e);
				state = State.MissingPerms;
			} else {
				throw e;
			}
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
				Try <a href="/login">logging in</a> or <a href="/iori/switch">switching</a>.
			</Box>
		{/if}
	</form>
</main>
