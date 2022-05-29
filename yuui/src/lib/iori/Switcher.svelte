<script lang="ts" type="module">
	//import Select from 'svelte-select';
	import { onMount } from 'svelte';
	import ULOView from '$lib/iori/ULO.svelte';

	import type { Client, ULO } from '$lib/api';

	export let client: Client;

	let ulos: Array<ULO>;
	//let items = ulosToItems(ulos);

	let value: {value: string, label: string};

	//function ulosToItems(ulos: Array<ULO>): Array<{value: string, label: string}> {
	//	return ulos.map(ulo => {
	//		return {
	//			value: ulo.id,
	//			label: ulo.name,
	//		};
	//	});
	//}

	onMount(async () => {
		ulos = await client.getULOs();
	});

	client.watchULOs().onmessage = (e) => {
		ulos = JSON.parse(e.data);
	};
</script>

<!--<Select {items} bind:value={value} on:select={switchULO} />-->

<div class="switcher">
	{#each ulos as ulo}
		<ULOView {ulo} on:choose={() => client.setULO(ulo.id)} />
	{/each}
</div>
