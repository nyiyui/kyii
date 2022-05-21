<script lang="ts" type="module">
	import UnsavedChanges from '$lib/UnsavedChanges.svelte';
	import { Client } from "$lib/api";
	import type { ApInput, AfInput } from "$lib/api";
	import { debugMode } from "$lib/store";
	import { browser } from "$app/env";
	import Icon from '@iconify/svelte';
	import Box from '../lib/Box.svelte';
	import AFInput from '../lib/AFInput.svelte';
	import APInput from '../lib/APInput.svelte';

	let initSlug: string;
	let slug: string;
	let slugTaken: boolean|null;
	let name: string;
	let email: string;
	let idUnsavedChanges = false;
	let submitIdError: string;

	let aps = new Array<ApInput>();
	let delAps = new Array<string>();

	function newAp() {
		aps.push({uuid: '', name: "New AP", reqs: []});
		aps = aps;
	}

	function delAp(i: number) {
		const ap = aps[i];
		if (ap.uuid !== '') {
			delAps.push(ap.uuid);
		}
		aps.splice(i, 1);
		aps = aps;
	}

	let afs = new Map<number, AfInput>();
	let largestAfN = 0;
	let delAfs = new Array<string>();
	let modifiedAfs = new Map<number, boolean>();
	let feedbacks = new Map<string, any>();
	let axUnsavedChanges = false;
	let submitAxError: string;

	$: {
		aps;
		afs;
		axUnsavedChanges = true;
	}

	function newAf() {
		largestAfN ++;
		afs.set(largestAfN, {uuid: '', name: "New AF", verifier: null, params: {}});
		afs = afs;
	}

	function delAf(n: number, uuid: string) {
		if (uuid !== '') {
			delAfs.push(uuid);
		}
		afs.delete(n);
		afs = afs;
	}

	function getLargestAfN(): number {
		return Math.max(largestAfN, ...Array.from(afs.entries()).map(kv => kv[0]));
	}

	let client: Client;

	(async () => {
		if (browser) {
			client = new Client();
			if (!await client.loggedIn()) {
				window.location.replace("/login");
			}
			const ax = await client.getAx();
			({ aps, afs } = ax.toInput());
			largestAfN = getLargestAfN();

			const id = await client.getId();
			({ slug, name, email } = id);
			initSlug = slug;
			slugFind();
		}
	})();

	async function slugFind() {
		idUnsavedChanges = true;
		if (slug == initSlug) {
			slugTaken = null;
			return;
		}
		slugTaken = (await client.username(slug)).exists; // TODO: fix naming inconsistency
	}

	async function submitId() {
		try {
			await client.submitId({ slug, name, email });
			submitIdError = '';
			idUnsavedChanges = false;
			console.log('submitId done');
		} catch (e) {
			console.error(`submitId: ${e}`);
			submitIdError = e.toString();
		}
	}

	async function submitAx() {
		try {
			feedbacks = await client.submitAx({
				aps,
				del_aps: delAps,
				afs: Array.from(afs.entries()).map(([key, value]) => ({key, value: {regen: modifiedAfs[key] || false, ...value}})),
				del_afs: delAfs,
			});
			submitAxError = '';
			axUnsavedChanges = false;
			console.log('submitAx done');
		} catch(e) {
			console.error(`submitAx: ${e}`);
			submitAxError = e.toString();
		}
		modifiedAfs = new Map<number, boolean>();
	}
</script>

<svelte:head>
	<title>Config</title>
</svelte:head>

<main>
	<h2>Identity</h2>
	<div class="flex">
		<div class="panel flex-in">
			<h3>
				Personal
				{#if idUnsavedChanges}
					<UnsavedChanges />
				{/if}
			</h3>
			<form class="identity">
				<label for="slug">Username</label>
				<input id="slug" type="slug" autocomplete="username" bind:value={slug} on:input={slugFind} />
				{#if slugTaken === true}
					<Icon icon="mdi:alert" style="color: var(--color-error);" />
					Taken
				{:else if slug === ""}
					<Icon icon="mdi:cancel" style="color: var(--color-error);" />
					Cannot be blank
				{:else if slugTaken === null}
					<Icon icon="mdi:check" style="color: var(--color-info);" />
					Current
				{:else if slugTaken === false}
					<Icon icon="mdi:check" style="color: var(--color-ok);" />
					Available
				{:else}
					Loading
				{/if}
				<br/>
				<label for="name">Name</label>
				<input id="name" type="name" autocomplete="name" bind:value={name} on:input={() => idUnsavedChanges = true} />
				{#if name === ""}
					<Icon icon="mdi:cancel" style="color: var(--color-error);" />
					Cannot be blank
				{:else if name !== ""}
					<Icon icon="mdi:check" style="color: var(--color-ok);" />
				{:else}
					Loading
				{/if}
				<br/>
				<label for="email">Email</label>
				<input id="email" type="email" autocomplete="email" bind:value={email} on:input={() => idUnsavedChanges = true} />
				{#if email === ""}
					<Icon icon="mdi:cancel" style="color: var(--color-error);" />
					Cannot be blank
				{:else if email !== ""}
					<Icon icon="mdi:check" style="color: var(--color-ok);" />
					Sure, why not (but idk lol)
				{:else}
					Loading
				{/if}
				<br/>
				<input class="update" type="button" on:click={submitId} value="Update" />
				{#if submitIdError}
					<Box level="error">
						{submitIdError}
					</Box>
				{:else if submitIdError === ''}
					<Box level="ok" />
				{/if}
			</form>
		</div>
		<div class="panel flex-in">
			<h3>Groups</h3>
			<strong>TODO</strong>
		</div>
	</div>
	<h2>
		Authentication
		{#if axUnsavedChanges}
			<UnsavedChanges />
		{/if}
	</h2>
	<div class="flex">
		<div class="panel flex-in">
			<h3>APs</h3>
			{#each Array.from(aps.entries()) as [i, ap]}
				<div class="ax-input">
					<APInput bind:ap={ap} {afs} />
					<input class="delete" type="button" on:click={() => delAp(i)} value="Delete" />
				</div>
			{/each}
			<input class="new" type="button" on:click={newAp} value="New" />
		</div>
		<div class="panel flex-in">
			<h3>AFs</h3>
			{#each [...afs] as [n, af]}
				<div class="ax-input">
					<AFInput {n} bind:af={af} feedback={feedbacks[n.toString()]} bind:modified={modifiedAfs[n]} />
					<input class="delete" type="button" on:click={() => delAf(n, af.uuid)} value="Delete" />
				</div>
			{/each}
			<input class="new" type="button" on:click={newAf} value="New" />
		</div>
	</div>
	<input class="update" type="button" on:click={submitAx} value="Update" />
	{#if submitAxError}
		<Box level="error">
			{submitAxError}
		</Box>
	{:else if submitAxError === ''}
		<Box level="ok" />
	{/if}
	<h2>Client-Specific</h2>
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
</main>

<style>
	.flex-in {
		flex: 50%;
	}

	.ax-input:not(:last-child) {
		margin-bottom: 16px;
	}
</style>
