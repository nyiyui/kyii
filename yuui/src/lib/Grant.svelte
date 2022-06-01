<script lang="ts" type="module">
	import Box from '$lib/Box.svelte';
	import Client from '$lib/Client.svelte';
	import type { Grant } from '$lib/api2';

	export let grant: Grant;
</script>

<div class="grant">
	<h2>Grant <code>{grant.id}</code></h2>
	To: <Client client={grant.client} /><br />
	Scope: <code>{grant.request.scope}</code><br />
	<Box level="debug">
		Issued at: {new Date(grant.request.issued_at*1000)}<br />
		Expires at: {new Date(grant.request.expires_at*1000)}<br />
		Has refresh token: {grant.request.has_refresh_token ? 'yes' : 'no'}<br />
		Token type: <code>{grant.request.token_type}</code><br />
		<code>{JSON.stringify(grant, null, 2)}</code>
	</Box>
	<input class="delete" type="button" value="Revoke" onclick={() => alert("TODO")} />
</div>
