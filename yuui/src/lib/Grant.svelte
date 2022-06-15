<script lang="ts" type="module">
	import BoxError from '$lib/BoxError.svelte'
	import Box from '$lib/Box.svelte'
	import Scope from '$lib/Scope.svelte'
	import Client from '$lib/Client.svelte'
	import { debugMode } from '$lib/store'
	import { client } from '$lib/api2'
	import type { Grant } from '$lib/api2'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let grant: Grant
	let revoked = grant.request.issued_at === grant.request.expires_at

	let error: string

	async function revoke() {
		try {
			await client.grantsRevoke(grant.id)
			revoked = true
			dispatch('reload')
		} catch (err) {
			error = err
		}
	}
</script>

<section class="grant panel flex flex-column">
	<div class="meta flex flex-row">
		<h2>Grant <code>{grant.id}</code></h2>
		<div class="tags">
			{#if revoked}
				<span class="tag">Revoked</span>
			{/if}
		</div>
		<div class="action">
			<input
				class="delete"
				type="button"
				value="Revoke (delete)"
				on:click={revoke}
				disabled={revoked}
			/>
			{#if $debugMode}
				<input class="delete" type="button" value="Force revoke" on:click={revoke} />
			{/if}
			<BoxError msg={error} passive />
		</div>
	</div>
	<div class="content">
		To: <Client client={grant.client} /><br />
		Scopes:
		<ul>
			{#each grant.request.scope.split(' ') as name}
				<li><Scope {name} /></li>
			{/each}
		</ul>
		Issued at: {new Date(grant.request.issued_at * 1000)}<br />
		<Box level="debug">
			Expires at: {new Date(grant.request.expires_at * 1000)}<br />
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
