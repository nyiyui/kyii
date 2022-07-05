<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Box from '$lib/Box.svelte'
	import Switcher from '$lib/iori/Switcher.svelte'
	import { browser } from '$app/env'
	import { page } from '$app/stores'
	import { getNext } from '$lib/util'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'

	let next

	onMount(() => {
		next = getNext($page.url.searchParams)
	})

	function choose() {
		if (next) {
			goto(next)
		}
	}
</script>

<svelte:head>
	<title>{$_('closet.title')}</title>
</svelte:head>

<main>
	<h1>{$_('closet.title')}</h1>
	{#if !next}
		<Box level="error">
			{$_('closet.no_next')}
		</Box>
	{/if}
	{#if browser}
		<Switcher on:choose={choose} force />
	{/if}
</main>
