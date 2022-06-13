<script lang="ts" type="module">
	import Logo from '$lib/header/Logo.svelte'
	import User from '$lib/header/User.svelte'
	import { page } from '$app/stores'
	import { debugMode } from '$lib/store'
	import { browser } from '$app/env'
	import { _ } from 'svelte-i18n'

	import { client, ulos as ulosStore } from '$lib/api2'
	import { get } from 'svelte/store'

	let loggedIn: boolean
	;(async () => {
		if (browser) {
			loggedIn = await client.loggedIn()
		}
	})()
</script>

<nav id="nav">
	<ul>
		<li>
			<Logo />
			{#if $debugMode}
				<a href="/config#debug">(debug mode)</a>
			{/if}
		</li>
		<li class:active={$page.url.pathname === '/about'}>
			<a sveltekit:prefetch href="/about">{$_('header.about')}</a>
		</li>
		{#if $debugMode}
			<li class:active={$page.url.pathname === '/ui'}>
				<a sveltekit:prefetch href="/ui">{$_('header.ui')}</a>
			</li>
		{/if}
		{#if loggedIn === undefined}
			<li>
				<span role="status">{$_('header.loading')}</span>
			</li>
		{:else if loggedIn}
			<li class:active={$page.url.pathname === '/uls'}>
				<a sveltekit:prefetch href="/uls">{$_('header.uls')}</a>
			</li>
			<li class:active={$page.url.pathname === '/grants'}>
				<a sveltekit:prefetch href="/grants">{$_('header.grants')}</a>
			</li>
		{:else}
			<li class:active={$page.url.pathname === '/login'}>
				<a sveltekit:prefetch href="/login">{$_('header.login')}</a>
			</li>
			<li class:active={$page.url.pathname === '/signup'}>
				<a sveltekit:prefetch href="/signup">{$_('header.signup')}</a>
			</li>
		{/if}
		<li class:active={$page.url.pathname === '/config'}>
			<a sveltekit:prefetch href="/config">{$_('header.config')}</a>
		</li>
		<li class="iori" class:active={$page.url.pathname === '/iori'}>
			<a sveltekit:prefetch href="/iori">
				<User />
				{$_('header.iori')}
				{browser ? `(${get(ulosStore).size})` : ''}
			</a>
		</li>
	</ul>
</nav>

<style>
	nav {
		padding: 4px;
	}

	.iori {
		float: right;
	}
</style>
