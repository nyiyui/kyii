<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Box from '$lib/Box.svelte'
	import Loading from '$lib/Loading.svelte'
	import ULOView from '$lib/iori/ULO.svelte'
	import { client, ulos as ulosStore, currentUlid } from '$lib/api2'
	import type { UUID } from 'uuid'
	import type { ULO } from '$lib/api2'
	import { User } from '$lib/api2'
	import { UnauthenticatedError } from '$lib/api2'
	import { debugMode } from '$lib/store'
	import { createEventDispatcher } from 'svelte'

	export let anonymous = true

	const dispatch = createEventDispatcher()

	async function choose(ulid) {
		if (ulid === null || ulid === "anonymous") {
			client.uloReset()
			synched = null
		} else {
			client.uloUse(ulid)
			try {
				await client.loginSync()
			} catch (err) {
				if (err instanceof UnauthenticatedError) {
					console.error('ul id invalid', ulid)
					if (ulid !== "anonymous") {
						$ulosStore.set(ulid, {
							...$ulosStore.get(ulid),
							invalid: true,
						})
						$ulosStore = $ulosStore
					}
				} else {
					console.error('syncing failed', err)
					synched = err
				}
			}
		}
		await reload()
		dispatch('choose', { ulid })
	}

	let dontReload = false

	let ulos: Array<[UUID, ULO]>
	reload()

	$: {
		$ulosStore
		reload()
	}

	async function reload() {
		if (dontReload) {
		dontReload = false
		return
		}
		console.log('reload', $ulosStore);
		ulos = [...$ulosStore.entries()]
		try {
			synched = await client.synchedLogin()
			if (synched === null) {
				// NOTE: avoid loop!
				await client.loginSync();
				synched = await client.synchedLogin()
			}
		} catch (err) {
			const ulid = $currentUlid
				if (err instanceof UnauthenticatedError) {
					console.error('ul id invalid', ulid)
					if (ulid !== "anonymous") {
						$ulosStore.set(ulid, {
							...$ulosStore.get(ulid),
							invalid: true,
						})
						$ulosStore = $ulosStore
						dontReload = true
						synched = null
					} else {
						synched = "anonymous"
					}
				} else {
					console.error('syncing failed', err)
					synched = err
				}
		}
	}

	let synched: User | UnauthenticatedError | null | "anonymous"
</script>

<div class="switcher">
	<Box level="info">
		{#if synched === null}
			Not synched
		{:else if synched === undefined}
			<Loading />
		{:else if synched === "anonymous"}
			{$_('iori.anonymous')}
		{:else if 'uid' in synched}
			{$_('iori.synched', { values: { synched } })}
		{:else if synched instanceof Error}
			<Box level="error">Error: {synched.message}</Box>
		{/if}
	</Box>
	{$_('iori.switcher.switch')}
	{#each ulos as [_, ulo]}
		{#if !ulo.invalid || $debugMode}
			<div class="ulo-view">
				<!-- TODO: decide: delete invalid ULOs when found + !debugMode? -->
				<ULOView
					{ulo}
			 		on:choose={() => {
			 			choose(ulo.ulid)
			 			reload()
					}}
					on:reload={reload}
					currentUlid={$currentUlid}
				/>
			</div>
		{/if}
	{/each}
	{#if anonymous}
		<div class="ulo-view">
			<ULOView ulo="anonymous" on:choose={() => choose(null)} currentUlid={$currentUlid} />
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
