<script lang="ts" type="module">
	import { Client } from "$lib/api";
	import type { UserLogin } from '$lib/api';
	import { browser } from "$app/env";
	import UserLoginInput from '$lib/UserLoginInput.svelte';

	let client: Client;
	let uls = new Array<UserLogin>();

	(async () => {
		if (browser) {
			client = new Client();
			if (!await client.loggedIn()) {
				console.log('not logged in');
				window.location.replace("/login");
			}

			uls = await client.listUls();
		}
	})();
</script>

<svelte:head>
	<title>Sessions</title>
</svelte:head>

<main class="logout">
	{#each Array.from(uls.entries()) as [i, ul]}
		<div class="user-login">
			<UserLoginInput
				bind:ul={ul}
				client={client}
				deleteCallback={() => {uls.splice(i, 1); uls = uls}}
		 	/>
		</div>
	{/each}
</main>
