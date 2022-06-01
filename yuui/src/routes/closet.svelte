<script lang="ts" type="module">
	import Box from '$lib/Box.svelte';
	import Switcher from '$lib/iori/Switcher.svelte';
	import { browser } from "$app/env";
	import { page } from '$app/stores';
	import { getNext } from '$lib/util';

	let next = getNext($page.url.searchParams);
</script>

<svelte:head>
	<title>Closet</title>
</svelte:head>

<main>
	{#if next !== null}
		<Box level="info">
			Please move
			<a href={next.toString()}>next</a>
			once you want to!
		</Box>
	{/if}
	{#if browser}
		<Switcher anonymous={false} />
	{/if}
</main>
