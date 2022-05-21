<script lang="ts" type="module">
	import { Client } from "../lib/api";
	import { browser } from "$app/env";

	let client: Client;

	(async () => {
		if (browser) {
			client = new Client();
			if (!await client.loggedIn()) {
				console.log('not logged in; cannot logout');
				window.location.replace("/login");
			}
		}
	})();

	async function logout() {
		await client.logout();
		window.location.replace("/");
	}
</script>

<svelte:head>
	<title>Logout</title>
</svelte:head>

<main class="logout">
	<input type="button" value="Logout" on:click={logout} />
</main>
