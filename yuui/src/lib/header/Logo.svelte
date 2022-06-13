<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import logo from '../../../static/favicon.svg'
</script>

<a sveltekit:prefetch href="/">
	<img id="logo" src={logo} alt={$_('header.home')} />
</a>

<style>
	#logo {
		width: 2em;
		height: 2em;
	}
</style>
