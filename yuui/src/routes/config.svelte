<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Autosaved from '$lib/Autosaved.svelte';
	import { client } from "$lib/api2";
	import { debugMode } from "$lib/store";
	import Box from '../lib/Box.svelte';
  import { Tabs, Tab, TabList, TabPanel } from 'svelte-tabs';
	import IdInput from '$lib/IdInput.svelte';
	import AxInput from '$lib/AxInput.svelte';
	import UnsavedChanges from '$lib/UnsavedChanges.svelte';
	import { browser } from "$app/env";

	let loggedIn: boolean | null = null;
	let axUC = false;
	let idUC = false;
	let commit = import.meta.env.VITE_BUILD_COMMIT as string;

	(async () => {
		if (browser) {
			loggedIn = await client.loggedIn();
		}
	})()
</script>

<svelte:head>
	<title>{$_('header.config')}</title>
</svelte:head>

<main>
	<Tabs>
		<TabList>
			<Tab>{$_('config.id.title')}{#if idUC}<UnsavedChanges />{/if}</Tab>
			<Tab>{$_('config.ax.title')}{#if axUC}<UnsavedChanges />{/if}</Tab>
			<Tab>{$_('config.client.title')} <Autosaved /></Tab>
		</TabList>
		<TabPanel>
			{#if loggedIn}
				<IdInput bind:idUnsavedChanges={idUC} />
			{:else}
				<Box level="warn">{@html $_('config.ax.login_required')}</Box>
			{/if}
		</TabPanel>
		<TabPanel>
			{#if loggedIn}
				<AxInput bind:unsavedChanges={axUC} />
			{:else}
				<Box level="warn">{@html $_('config.ax.login_required')}</Box>
			{/if}
		</TabPanel>
		<TabPanel>
			<Box level="info">{$_('config.client.help')}</Box>
			<h2 id="debug">{$_('config.client.debug_mode')}</h2>
			<label>
				<input type="radio" bind:group={$debugMode} value={true} />
				{$_('config.client.debug_mode_on')}
			</label>
			<label>
				<input type="radio" bind:group={$debugMode} value={false} />
				{$_('config.client.debug_mode_off')}
			</label>
			<Box level="info">
				{$_('config.client.debug_mode_help')}
			</Box>
			<h2>{$_('config.client.etc')}</h2>
			<label>
				{$_('config.client.api_base_url')}
				<input type="url" value={client.baseUrl.toString()} disabled />
			</label>
			<br/>
			<label>
				{$_('config.client.lang.title')}
				<input type="text" value={$_('config.client.lang.current')} disabled />
			</label>
			<Box level="info">
				{$_('config.client.lang.help')}
			</Box>
			<label>
				{$_('config.client.cs.title')}
				<input class="light" type="text" value={$_('config.client.cs.light')} disabled />
				<input class="dark" type="text" value={$_('config.client.cs.dark')} disabled />
			</label>
			<Box level="info">
				{$_('config.client.cs.help')}
			</Box>
			{#if commit}
				<label>
					{$_('config.client.commit.title')}
					<input type="text" value={commit} disabled />
				</label>
			{/if}
		</TabPanel>
	</Tabs>
</main>

<style>
	@media (prefers-color-scheme: dark) {
		.light { display: none; }
		.dark { display: initial; }
	}
	@media (prefers-color-scheme: light) {
		.light { display: initial; }
		.dark { display: none; }
	}
</style>
