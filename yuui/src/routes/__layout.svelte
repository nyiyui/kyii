<script lang="ts">
  import { waitLocale } from 'svelte-i18n'

  export async function preload() {
    return waitLocale()
  }

	import { isLoading } from 'svelte-i18n'

	import '../i18n';
</script>

<script lang="ts" context="module">
	import GlobalBar from '$lib/header/GlobalBar.svelte';
	import Header from '$lib/header/Header.svelte';
	import '../app.css';
</script>

{#if $isLoading}
	<p>
		Loading…
		読込中…
	</p>
{:else}
	<header>
		<GlobalBar />
		<Header />
	</header>
	
	<main>
		<slot />
	</main>
	
	<footer>
	</footer>
{/if}

<style>
	header {
		display: flex;
		flex-direction: column;

		position: fixed;
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

		margin-top: 71px;
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
