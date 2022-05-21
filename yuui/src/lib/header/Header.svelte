<script lang="ts" type="modue">
	import { page } from '$app/stores';
	import { debugMode } from '$lib/store';
	import { t, locale, locales } from '$lib/translations';
	import logo from '../../../static/favicon.svg';
	import { browser } from '$app/env';

	import { Client } from '../../lib/api';
	let client: Client;

	let loggedIn: boolean;
	(async () => {
		if (browser) {
			client = new Client();
			loggedIn = await client.loggedIn();
		}
	})();
</script>

<header>
	<nav id="nav">
		<ul>
			<li class:active={$page.url.pathname === '/'}>
				<a sveltekit:prefetch href="/">
					<img id="logo" src={logo} alt={$t('header.home')} />
				</a>
				{#if $debugMode}
					(debug mode)
				{/if}
			</li>
			<li class:active={$page.url.pathname === '/about'}>
				<a sveltekit:prefetch href="/about">About{$t('header.about')}</a>
			</li>
			{#if loggedIn === undefined}
			<li>
				<span role="status">loading{$t('header.loading')}</span>
			</li>
			{:else if loggedIn}
			<li class:active={$page.url.pathname === '/logout'}>
				<a sveltekit:prefetch href="/logout">Logout{$t('header.logout')}</a>
			</li>
			<li class:active={$page.url.pathname === '/config'}>
				<a sveltekit:prefetch href="/config">Config{$t('header.config')}</a>
			</li>
			<li class:active={$page.url.pathname === '/uls'}>
				<a sveltekit:prefetch href="/uls">Sessions{$t('header.uls')}</a>
			</li>
			{:else}
			<li class:active={$page.url.pathname === '/login'}>
				<a sveltekit:prefetch href="/login">Login{$t('header.login')}</a>
			</li>
			<li class:active={$page.url.pathname === '/signup'}>
				<a sveltekit:prefetch href="/signup">Signup{$t('header.signup')}</a>
			</li>
			{/if}
			<li>
				<select bind:value="{$locale}">
				  {#each $locales as value}
						<option value="{value}">{value} {$t(`lang.${value}`)}</option>
				  {/each}
				</select>
			</li>
		</ul>
	</nav>
</header>

<style>
	#logo {
		width: 2em;
		height: 2em;
	}

	#nav > ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
	}

	#nav li {
		display: inline-block;
	}

	#nav a {
		text-decoration: none;
	}
</style>
