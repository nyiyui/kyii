<script lang="ts" type="module">
	import Box from '$lib/Box.svelte';
	import ULOView from '$lib/iori/ULO.svelte';
	import { client, ulos as ulosStore } from '$lib/api2';
	import type { UUID } from 'uuid';
	import type { User, ULO } from '$lib/api2';
	import { get } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';
	import { debugMode } from '$lib/store';

	export let anonymous = true;

	const dispatch = createEventDispatcher();

	let currentUlid = client.currentUlid;

	async function choose(ulid) {
		if (ulid === null) {
			client.uloReset();
			currentUlid = null;
		} else {
			client.uloUse(ulid);
			currentUlid = client.currentUlid;
		}
		await client.syncLogin();
		await reload();
		dispatch( 'choose', { ulid } );
	}

	let ulos: Array<[UUID, ULO]>;
	reload();

	async function reload() {
		ulos = [...get(ulosStore).entries()];
		synched = await client.synchedLogin();
	}

	let synched: User;
</script>

<div class="switcher">
	<Box level="debug">
		{#if synched}
			Synched:
			{synched.name}
			(<code>{synched.slug}</code>)
			(<code>{synched.uid}</code>)
		{:else if synched === null}
			Not synched
		{:else}
			loading
		{/if}
	</Box>
	Switch:
	{#each ulos as [_, ulo]}
		<div class="ulo-view">
			<ULOView {ulo} on:choose={() => choose(ulo.ulid)} on:reload={reload} currentUlid={currentUlid} />
		</div>
	{/each}
	{#if anonymous}
		<div class="ulo-view">
			<ULOView ulo="anonymous" on:choose={() => choose(null)} currentUlid={currentUlid} />
		</div>
	{/if}
	<div class="ulo-view">
		<Box level="info">
			Or, you can
			<a href="/login">login</a>, or
			<a href="/signup">signup</a>.
		</Box>
	</div>
</div>

<style>
	.ulo-view:not(:last-child) {
		padding-bottom: 1em;
		border-bottom: 1px solid #ccc;
		margin-bottom: 1em;
	}
</style>
