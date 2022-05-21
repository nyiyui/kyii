<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import type { Load } from '@sveltejs/kit';
  import { t, locale, loadTranslations } from '$lib/translations';
	import '../app.css';
	
  export const load: Load = async ({ url }) => {
    const { pathname } = url;
    const defaultLocale = 'en-CA';
    const initLocale = locale.get() || defaultLocale;
    await loadTranslations(initLocale, pathname);
    return {};
  }
</script>

<Header />

<main>
	<slot />
</main>

<footer>
	<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
	{$t('common.home')}
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
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

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
