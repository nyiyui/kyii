<script context="module">
	import { t } from '$lib/translations';
</script>

<svelte:head>
	<title>About</title>
</svelte:head>

<div class="content">
	<h1>{$t('about.title')}</h1>

	<p>
		<a href={import.meta.env.VITE_PAIMON_BASE_URL.toString()}>Docs</a>
	</p>
</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}
</style>
