<script lang="ts" type="module">
	import Box from '$lib/Box.svelte';
	import Client from '$lib/Client.svelte';
	import { client } from '$lib/api2';
	import type { Grant } from '$lib/api2';

	export let grant: Grant;

	async function revoke() {
		client.grantsRevoke(grant.id);
	}
</script>

<section class="grant panel flex flex-column">
	<div class="meta flex flex-row">
		<h2>Grant <code>{grant.id}</code></h2>
		<div class="action">
			<input class="delete" type="button" value="Revoke" onclick={revoke} />
		</div>
	</div>
	<div class="content">
		To: <Client client={grant.client} /><br />
		Scope: <code>{grant.request.scope}</code><br />
		<Box level="debug">
			Issued at: {new Date(grant.request.issued_at*1000)}<br />
			Expires at: {new Date(grant.request.expires_at*1000)}<br />
			Has refresh token: {grant.request.has_refresh_token ? 'yes' : 'no'}<br />
			Token type: <code>{grant.request.token_type}</code><br />
			<code>{JSON.stringify(grant, null, 2)}</code>
		</Box>
	</div>
</section>

<style>
	.meta > h2 {
		flex-grow: 1;
	}

	.meta > .action {
		align-self: flex-end;
	}
</style>
