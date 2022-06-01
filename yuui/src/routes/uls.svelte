<script lang="ts" type="module">
	import BoxError from "$lib/BoxError.svelte";
	import { client } from "$lib/api2";
	import type { UserLogin } from '$lib/api2';
	import { browser } from "$app/env";
	import UserLoginInput from '$lib/UserLoginInput.svelte';

	let uls = new Array<UserLogin>();
	let error = '';

	(async () => {
		if (browser) {
			if (!await client.loggedIn()) {
				console.log('not logged in');
				window.location.replace("/login");
			}

			try {
				uls = await client.ulsList();
			} catch (e) {
				error = e.message;
			}
		}
	})();
</script>

<svelte:head>
	<title>Sessions</title>
</svelte:head>

<main class="logout">
	<BoxError msg={error} passive />
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
