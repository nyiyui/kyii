<script lang="ts" type="module">
	import { Client } from "$lib/api";
	import { browser } from "$app/env";
	import Box from '$lib/Box.svelte';

	let client: Client;

	let signedUp = false;
	// TODO: next, selfnext, etc

	(async () => {
		if (browser) {
			client = new Client();
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
		console.log(`signed up; uid is ${uid}`);
		signedUp = true;
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
		<input type="button" disabled={signedUp} on:click={signup} value="Create Account" />
		{#if signedUp}
			<a href="/config">Next</a>
		{/if}
	</form>
</main>
