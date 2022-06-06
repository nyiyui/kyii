<script lang="ts" type="module">
	import { _ } from 'svelte-i18n';
	import Box from '$lib/Box.svelte';
	import Loading from '$lib/Loading.svelte';
	import ULOView from '$lib/iori/ULO.svelte';
	import { client, ulos as ulosStore } from '$lib/api2';
	import type { UUID } from 'uuid';
	import type { ULO } from '$lib/api2';
	import { User } from '$lib/api2';
	import { UnauthenticatedError } from '$lib/api2';
	import { get } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';

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
		try {
			await client.loginSync();
		} catch (err) {
			if (err instanceof UnauthenticatedError) {
				synched = err;
			} else {
				throw err;
			}
		}
		await reload();
		dispatch( 'choose', { ulid } );
	}

	let ulos: Array<[UUID, ULO]>;
	reload();

	async function reload() {
		ulos = [...get(ulosStore).entries()];
		try {
			synched = await client.synchedLogin();
		} catch (err) {
			if (err instanceof UnauthenticatedError) {
				synched = err;
			} else {
				throw err;
			}
		}
	}

	let synched: User | UnauthenticatedError;
</script>

<div class="switcher">
	<Box level="debug">
		{#if synched instanceof User}
			Synched:
			{synched.name}
			(<code>{synched.slug}</code>)
			(<code>{synched.uid}</code>)
		{:else if synched === null}
			Not synched
		{:else if synched === undefined}
			<Loading />
		{:else if synched instanceof Error}
			<Box level="error">Error: {synched.message}</Box>
		{/if}
	</Box>
	{$_('iori.switcher.switch')}
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
			{@html $_('iori.switcher.or')}
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
