<script lang="ts" type="modue">
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n'
</script>

<nav id="global-bar">
	<ul>
		<li class:active={$page.url.pathname === '/'}>
			<a sveltekit:prefetch href="/">
				{$_('global_bar.self')}
			</a>
		</li>
		<li>
			<a href="https://kiki2.nyiyui.ca">{$_('global_bar.kiki')}</a>
		</li>
		<li>
			<a href="https://nona.nyiyui.ca">Nona</a>
		</li>
		<li>
			<a href="https://makura.nyiyui.ca">Inaba</a>
		</li>
	</ul>
</nav>

<style>
	nav {
		padding: 4px;
	}
</style>
