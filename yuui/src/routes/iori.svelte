<script lang="ts" type="module">
	import Switcher from '$lib/iori/Switcher.svelte';
	import { browser } from "$app/env";
	import { page } from '$app/stores';
	import { getNext } from '$lib/util';

	let next;

	if (browser) {
		next = getNext($page.url.searchParams);
	}
</script>

<main>
	{#if next}
		<a href={next.toString()}>Next</a>
	{/if}
	{#if browser}
		<Switcher />
	{/if}
</main>
