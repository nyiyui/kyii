<script lang="ts" type="module">
	import type { Client } from "$lib/api";
	import type { ApInput, AfInput } from "$lib/api";
	import AFInput from '../lib/AFInput.svelte';
	import APInput from '../lib/APInput.svelte';
	import { onMount } from 'svelte';
	import BoxError from '../lib/BoxError.svelte';

	export let client: Client;

	let aps = new Array<ApInput>();
	let delAps = new Array<string>();

	function newAp() {
		aps.push({uuid: '', name: '', reqs: []});
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

	let tafids = new Map<number, string>();
	let afs = new Map<number, AfInput>();
	let regens = new Map<number, boolean>();
	let largestAfN = 0;
	let delAfs = new Array<string>();
	export let unsavedChanges = false;
	let submitAxError: string;

	$: {
		aps;
		afs;
		unsavedChanges = true;
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

	async function submitAx() {
		try {
			const preparedAps = aps.map(ap => ({
				uuid: ap.uuid,
				name: ap.name,
				taf_reqs: ap.reqs.map(n => tafids[n]),
			}));
			console.log(`aps: ${JSON.stringify(preparedAps)}`);
			await client.submitAx({
				aps: preparedAps,
				del_aps: delAps,
				del_afs: delAfs.concat(
					Array.from(regens.entries()).filter(([_, regen]) => regen).map(([n, _]) => tafids[n])
				),
			});
			submitAxError = '';
			unsavedChanges = false;
		} catch(e) {
			submitAxError = e.toString();
		}
	}

	onMount(async () => {
		const ax = await client.getAx();
		({ aps, afs } = ax.toInput());
		largestAfN = getLargestAfN();
		tafids = new Map();
		regens = new Map();
		Array.from(afs.entries()).forEach(([n, af]) => {
			tafids[n] = af.uuid;
			regens[n] = false;
		});
	});
</script>

<div class="ax-input">
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
					<AFInput {n} bind:af={af} bind:tafid={tafids[n]} bind:regen={regens[n]} {client} />
					<input class="delete" type="button" on:click={() => delAf(n, af.uuid)} value="Delete" />
				</div>
			{/each}
			<input class="new" type="button" on:click={newAf} value="New" />
		</div>
	</div>
	<input class="update" type="button" on:click={submitAx} value="Update" />
	<BoxError msg={submitAxError} />
</div>

<style>
	.flex-in {
		flex: 50%;
	}

	.ax-input:not(:last-child) {
		margin-bottom: 16px;
	}
</style>
