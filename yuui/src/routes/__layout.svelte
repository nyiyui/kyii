<script lang="ts" context="module">
	import { _ } from 'svelte-i18n'
	import Header from '$lib/header/Header.svelte'
	import '../app.css'
</script>

<script lang="ts">
	import { waitLocale } from 'svelte-i18n'

	export async function preload() {
		return waitLocale()
	}

	import { isLoading } from 'svelte-i18n'

	import { start } from '../i18n'

	start()
</script>

<svelte:head>
	{#if $isLoading}
		<title>Kyii Yuui / ゆうい</title>
	{:else}
		<title>{$_('header.home')}</title>
	{/if}
</svelte:head>

{#if $isLoading}
	<p>Loading… 読込中…</p>
{:else}
	<header>
		<Header />
	</header>

	<main>
		<slot />
	</main>

	<footer />
{/if}

<style>
	header {
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg);
		border-bottom: 1px solid var(--color-neutral);

		position: sticky;
		top: 0;
		width: 100%;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
