<script lang="ts" type="module">
	import Loading from "$lib/Loading.svelte";
	import GrantView from "$lib/Grant.svelte";
	import BoxError from "$lib/BoxError.svelte";
	import { browser } from "$app/env";
	import { client } from "$lib/api2";
	import type { Grant } from "$lib/api2";

	let grants: Array<Grant>;
	let error = '';
	enum State {
		Loading,
		LoadingError,
		Loaded,
	}
	let state: State;

	(async () => {
		if (browser) {
			if (!await client.loggedIn()) {
				console.log('not logged in');
				window.location.replace("/login");
			}
			await reload();
		}
	})();

	async function reload() {
		console.log('reload');
		state = State.Loading;
		try {
			grants = await client.grantsList();
			state = State.Loaded;
		} catch (e) {
			error = e.message;
			state = State.LoadingError;
		}
	}
</script>

<main class="grants">
	<input type="button" value="Reload" on:click={reload} disabled={state === State.Loading} />
	{#if state === State.Loading}
		<Loading />
	{:else}
		{#if state === State.LoadingError}
			<BoxError msg={error} passive />
		{:else if state === State.Loaded}
			{#each grants as grant}
				<GrantView grant={grant} on:reload={reload} />
			{/each}
		{/if}
	{/if}
</main>
