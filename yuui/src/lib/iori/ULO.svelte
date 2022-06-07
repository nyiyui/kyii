<script lang="ts" type="module">
	import { _ } from "svelte-i18n";
	import User from '$lib/iori/User.svelte';
	import BoxError from '$lib/BoxError.svelte';
	import Box from '$lib/Box.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { LooseULO } from '$lib/api2';
	import { client } from '$lib/api2';
	import { debugMode } from '$lib/store';

	const dispatch = createEventDispatcher();

	export let ulo: LooseULO;
	export let currentUlid: string;

	let err: Error | null = null;

	async function logout() {
		if (ulo === "anonymous")
			throw new TypeError("cannot logout from anonymous user");
		const c = client.uloWith(ulo.ulid);
		try {
			await c.logout();
			client.uloDel(ulo.ulid);
			dispatch('reload');
		} catch (e) {
			err = e;
		}
	}

	function forget() {
		if (ulo === "anonymous")
			throw new TypeError("cannot forget anonymous user");
		client.uloDel(ulo.ulid);
		dispatch('reload');
	}

	let chosen = (ulo === "anonymous" && currentUlid === null) || (ulo !== "anonymous" && currentUlid === ulo.ulid);
</script>

<div class="ulo" class:chosen={(ulo === "anonymous" && currentUlid === null) || (ulo !== "anonymous" && currentUlid === ulo.ulid)}>
	<div class="user">
		{#if ulo === "anonymous"}
			<User uid="anonymous" name="" slug="" />
		{:else}
			<User uid={ulo.uid} name={ulo.name} slug={ulo.slug} />
		{/if}
	</div>
	{#if ulo !== "anonymous"}
		{#if $debugMode}
			<input class="action delete" type="button" value={$_('iori.ulo.delete')} on:click={forget} disabled={currentUlid === ulo.ulid} />
		{/if}
		<input class="action warn" type="button" value={$_('iori.ulo.logout')} on:click={logout} disabled={currentUlid === ulo.ulid} />
		<Box level="debug">
			<code>{JSON.stringify(ulo)}</code>
		</Box>
	{/if}
	<input class="action ok" type="button" value={$_('iori.ulo.choose')} on:click={() => dispatch('choose')} disabled={currentUlid === ulo.ulid} />
	<BoxError msg={err ? err.toString() : null} passive />
</div>

<style>
	.action {
		float: right;
	}

	.ulo {
		display: flex;
		align-items: center;
	}

	.user {
		flex-grow: 1;
	}
</style>
