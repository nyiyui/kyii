<script lang="ts" type="module">
	import IdInput from '$lib/IdInput.svelte';
	import AxInput from '$lib/AxInput.svelte';
	import UnsavedChanges from '$lib/UnsavedChanges.svelte';
	import Autosaved from '$lib/Autosaved.svelte';
	import { Client } from "$lib/api";
	import { debugMode, apiBaseUrl } from "$lib/store";
	import { browser } from "$app/env";
	import Box from '../lib/Box.svelte';

	let axUnsavedChanges = false;

	let client: Client;

	(async () => {
		if (browser) {
			client = new Client($apiBaseUrl);
			if (!await client.loggedIn()) {
				window.location.replace("/login");
			}
		}
	})();
</script>

<svelte:head>
	<title>Config</title>
</svelte:head>

<main>
	<h2>Identity</h2>
	<IdInput {client} />
	<h2>
		Authentication
		{#if axUnsavedChanges}
			<UnsavedChanges />
		{/if}
	</h2>
	<AxInput bind:unsavedChanges={axUnsavedChanges} {client} />
	<h2>Client-Specific <Autosaved /></h2>
	<h3>Debug Mode</h3>
	<label>
		On
		<input type="radio" bind:group={$debugMode} value={true} />
	</label>
	<label>
		Off
		<input type="radio" bind:group={$debugMode} value={false} />
	</label>
	<Box level="info">
		This only shows data already available to Yuui (hidden if Debug Mode is off).
	</Box>
	<h3>Etc</h3>
	<label>
		Airy API Base URL
		<input type="url" bind:value={$apiBaseUrl} />
	</label>
</main>
