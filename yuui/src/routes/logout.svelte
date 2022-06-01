<script lang="ts" type="module">
	import { client } from "$lib/api2";
	import { browser } from "$app/env";

	(async () => {
		if (browser) {
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
