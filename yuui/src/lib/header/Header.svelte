<script lang="ts" type="module">
	import Icon from '@iconify/svelte'
	import Logo from '$lib/header/Logo.svelte'
	import User from '$lib/header/User.svelte'
	import { page } from '$app/stores'
	import { debugMode, devOauth } from '$lib/store'
	import { browser } from '$app/env'
	import { _ } from 'svelte-i18n'

	import { client } from '$lib/api2'

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
		{#if $debugMode}
			<li class:active={$page.url.pathname === '/ui/'}>
				<a sveltekit:prefetch href="/ui">{$_('header.ui')}</a>
			</li>
			<li>
				<a sveltekit:prefetch href={import.meta.env.VITE_API_BASE_URL.toString()}> Airy </a>
			</li>
		{/if}
		{#if loggedIn === undefined}
			<li>
				<span role="status">{$_('header.loading')}</span>
			</li>
		{:else if loggedIn}
			<li class:active={$page.url.pathname === '/uls/'}>
				<a sveltekit:prefetch href="/uls">
					<Icon icon="mdi:account-box-multiple" />
					{$_('header.uls')}
				</a>
			</li>
			{#if $devOauth}
				<li class:active={$page.url.pathname === '/oclients/'}>
					<a sveltekit:prefetch href="/oclients">
						<Icon icon="mdi:apps" />
						{$_('header.oclients')}
					</a>
				</li>
			{/if}
			<li class:active={$page.url.pathname === '/grants/'}>
				<a sveltekit:prefetch href="/grants">
					<Icon icon="mdi:shield-check" />
					{$_('header.grants')}
				</a>
			</li>
			<li class:active={$page.url.pathname === '/remote-decide/'}>
				<a sveltekit:prefetch href="/remote-decide">
					<Icon icon="mdi:devices" />
					{$_('remote-decide.title')}
				</a>
			</li>
			<li class:active={$page.url.pathname === '/les/'}>
				<a sveltekit:prefetch href="/les">
					<Icon icon="mdi:script-outline" />
					{$_('header.les')}
				</a>
			</li>
		{:else}
			<li class:active={$page.url.pathname === '/signup/'}>
				<a sveltekit:prefetch href="/signup">{$_('header.signup')}</a>
			</li>
		{/if}
		<li class:active={$page.url.pathname === '/config/'}>
			<a sveltekit:prefetch href="/config"><Icon icon="mdi:cog" /> {$_('header.config')}</a>
		</li>
		<li class="iori" class:active={$page.url.pathname === '/iori/'}>
			<a sveltekit:prefetch href="/iori">
				<User />
			</a>
		</li>
	</ul>
</nav>

<style>
	nav {
		/* TODO: fix bug where <Select /> shows over nav */
		padding: 4px;
	}

	.iori {
		float: right;
	}

	.active a {
		color: var(--color-fg);
	}
</style>
