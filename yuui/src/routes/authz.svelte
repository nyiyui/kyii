<script lang="ts" type="module">
	import { page } from '$app/stores';
	import { Client } from "../lib/api";
	import { browser } from "$app/env";
	import { debugMode, apiBaseUrl } from "$lib/store";
	import Box from "$lib/Box.svelte";
	import type { Grant } from '$lib/api';

	let client: Client;
	let csrfToken: string;
	let grant: Grant | null;

	(async () => {
		if (browser) {
			client = new Client($apiBaseUrl);
			if (!(await client.loggedIn()))
				window.location.replace(`/login?selfnext=${encodeURIComponent(window.location.pathname)}&selfargs=${encodeURIComponent(window.location.search.slice(1))}`);

			csrfToken = await client.getCsrfToken();
			const azrqid = $page.url.searchParams.get('azrqid');
			console.log(`AzRqID: ${azrqid}`);
			grant = await client.getAzrq(azrqid);
		}
	})();
</script>

<svelte:head>
	<title>Authorize</title>
</svelte:head>

<main>
	{#if grant === undefined}
		Loading
	{:else if grant === null}
		<Box level="error">
			Grant already used (may be authorized or denied).
		</Box>
		<Box level="info">
			If you want to retry,
			you may want to <input type="button" on:click={() => history.back()} value="go back" /> (again).
		</Box>
	{:else}
		<a href="{grant.client.uri}">{grant.client.name}</a> is requesting:
		<ul>
			{#each grant.request.scope.split(' ') as scope}
				<li><code>{scope}</code></li>
			{/each}
		</ul>
		<div class="panel">
			Grant: <pre>{JSON.stringify(grant, null, 2)}</pre>
		</div>
		<form action="{$apiBaseUrl}/oauth/authorize?{new URLSearchParams(grant.args).toString()}" method="post">
			<input type="hidden" name="_csrf_token" value="{csrfToken}" />
			<input class="update" type="submit" name="action_allow" value="Allow" />
			<input class="delete" type="submit" name="action_deny" value="Deny" />
		</form>
	{/if}
</main>
