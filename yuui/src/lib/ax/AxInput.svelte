<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { client } from '$lib/api2'
	import type { ApInput, AfInput } from '$lib/api2'
	import AFInput from '$lib/ax/AFInput.svelte'
	import APInput from '$lib/ax/APInput.svelte'
	import { onMount } from 'svelte'
	import Loading from '$lib/Loading.svelte'
	import Box from '$lib/Box.svelte'
	import BoxError from '$lib/BoxError.svelte'

	let aps = new Array<ApInput>()
	let delAps = new Array<string>()
	let preparedAx
	let warnings: Array<any> // eslint-disable-line @typescript-eslint/no-explicit-any

	function newAp() {
		aps.push({ uuid: '', name: 'New AP', reqs: [] })
		aps = aps
	}

	function delAp(i: number) {
		const ap = aps[i]
		if (ap.uuid !== '') {
			delAps.push(ap.uuid)
		}
		aps.splice(i, 1)
		aps = aps
	}

	let tafids: Record<number, string> = {}
	let afs = new Array<AfInput>()
	let regens = new Map<number, boolean>()
	let delAfs = new Array<string>()
	export let unsavedChanges = false
	let submitAxError: string

	$: {
		aps
		afs
		unsavedChanges = true
	}

	function newAf() {
		afs.push({ uuid: '', name: 'New AF', verifier: null, params: {} })
		afs = afs
	}

	function delAf(n: number, uuid: string) {
		console.log('delAf', n, uuid)
		if (uuid !== '') {
			delAfs.push(uuid)
			delAfs = delAfs
		}
		console.log('delAf2', afs)
		afs.splice(n, 1)
		afs = afs
	}

	$: {
		afs
		console.log('afs reload')
	}

	function reload() {
		console.log('afs explicit reload')
		afs = afs
	}

	$: {
		console.log('prepare', aps)
		preparedAx = {
			aps,
			afs: Array.from(afs.entries()).map(([n, af]) => ({
				uuid: af.uuid || tafids[n],
				name: af.name
			})),
			del_aps: delAps,
			del_afs: delAfs.concat(
				Array.from(regens.entries())
					.filter((pair) => pair[1])
					.map((pair) => tafids[pair[0]])
			)
		}
	}

	async function submitAx() {
		try {
			const data = await client.submitAx(preparedAx)
			warnings = data.warnings || []
			submitAxError = ''
			unsavedChanges = false
		} catch (e) {
			submitAxError = e.toString()
		}
	}

	onMount(async () => {
		await client.clearTafs()
		const ax = await client.getAx()
		console.log('getAx2', ax.aps)
		;({ aps, afs } = ax)
		tafids = {}
		regens = new Map()
		Array.from(afs.entries()).forEach(([n, af]) => {
			tafids[n] = af.uuid
			regens[n] = false
		})
	})
</script>

<div class="ax-input">
	<div class="flex">
		<div class="padded flex-in">
			<h2>{$_('login.aps')}</h2>
			{#if aps}
				<input class="new" type="button" on:click={newAp} value={$_('config.new')} />
				{#each Array.from(aps.entries()) as [i, ap]}
					<div class="ax-input">
						<APInput bind:aps bind:ap {afs} afids={tafids} on:delete={() => delAp(i)} />
					</div>
				{/each}
			{:else}
				<Loading />
			{/if}
		</div>
		<div class="padded flex-in">
			<h2>{$_('login.afs')}</h2>
			<Box level="debug">{JSON.stringify(afs)}</Box>
			{#if afs}
				<input class="new" type="button" on:click={newAf} value={$_('config.new')} />
				{#each [...afs.entries()] as [n, af]}
					<div class="ax-input">
						<AFInput
							{n}
							bind:af
							bind:tafid={tafids[n]}
							bind:regen={regens[n]}
							on:reload={reload}
							on:delete={() => delAf(n, af.uuid)}
						/>
					</div>
				{/each}
			{:else}
				<Loading />
			{/if}
		</div>
	</div>
	<input class="update" type="button" on:click={submitAx} value={$_('config.update')} />
	<BoxError msg={submitAxError} />
	{#if warnings && warnings.length > 0}
		{#each warnings as warning}
			<Box level="warn">{warning}</Box>
		{/each}
	{/if}
	<Box level="debug">
		Prepared:
		<pre>{JSON.stringify(preparedAx, null, 2)}</pre>
		Warnings:
		<pre>{JSON.stringify(warnings, null, 2)}</pre>
	</Box>
</div>

<style>
	/*
	.flex-in {
		flex: 50%;
	}
	*/

	.flex {
		flex-wrap: wrap;
	}

	.flex-in {
		flex-grow: 1;
	}

	.ax-input:not(:last-child) {
		padding-bottom: 16px;
		border-bottom: 1px solid var(--color-2);
		margin-bottom: 16px;
	}
</style>
