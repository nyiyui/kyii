<script context="module">
	import { _ } from 'svelte-i18n'
</script>

<svelte:head>
	<title>{$_('header.about')}</title>
</svelte:head>

<div class="content">
	<h1>{$_('header.about')}</h1>

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
