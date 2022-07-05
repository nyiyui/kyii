<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Box from '$lib/Box.svelte'
	import Switcher from '$lib/iori/Switcher.svelte'
	import { browser } from '$app/env'
	import { page } from '$app/stores'
	import { getNext } from '$lib/util'
	import { goto } from '$app/navigation'

	let next

	if (browser) {
		next = getNext($page.url.searchParams)
	}
</script>

<svelte:head>
	<title>{$_('closet.title')}</title>
</svelte:head>

<main>
	<h1>{$_('closet.title')}</h1>
	{#if next}
		<Box level="info">
			{$_('closet.move')}
			<input type="button" on:click={() => goto(next)} value={$_('closet.next')} />
		</Box>
	{/if}
	{#if browser}
		<Switcher />
	{/if}
</main>
