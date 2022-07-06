<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import LangSelect from '$lib/LangSelect.svelte'
	import Icon from '@iconify/svelte'
	import Autosaved from '$lib/Autosaved.svelte'
	import { client } from '$lib/api2'
	import { debugMode, allowAnonymous, allowMULPU, devOauth } from '$lib/store'
	import Box from '$lib/Box.svelte'
	import { Tabs, Tab, TabList, TabPanel } from 'svelte-tabs'
	import IdInput from '$lib/id/IdInput.svelte'
	import AxInput from '$lib/ax/AxInput.svelte'
	import UnsavedChanges from '$lib/UnsavedChanges.svelte'
	import { browser } from '$app/env'
	import { reset as storeReset } from '$lib/store'
	import { reset as api2Reset } from '$lib/api2'

	let loggedIn: boolean | null = null
	let axUC = false
	let idUC = false
	let commit = import.meta.env.VITE_BUILD_COMMIT as string

	;(async () => {
		if (browser) {
			loggedIn = await client.loggedIn()
		}
	})()

	function reset() {
		api2Reset()
		storeReset()
	}
</script>

<svelte:head>
	<title>{$_('header.config')}</title>
</svelte:head>

<main>
	<Tabs>
		<TabList>
			<Tab>
				<Icon icon="mdi:account" />
				{$_('config.id.title')}
				{#if idUC}<UnsavedChanges />{/if}
			</Tab>
			<Tab>
				<Icon icon="mdi:shield-key" />
				{$_('config.ax.title')}
				{#if axUC}<UnsavedChanges />{/if}
			</Tab>
			<Tab>
				<Icon icon="mdi:cellphone" />
				{$_('config.client.title')}
				<Autosaved />
			</Tab>
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
			<h2 id="debug">{$_('config.client.debug')}</h2>
			<label>
				<input type="checkbox" bind:checked={$debugMode} />
				{$_('config.client.debug_mode')}
			</label>
			<Box level="info">
				{$_('config.client.debug_mode_help')}
			</Box>
			<label>
				<input type="checkbox" bind:checked={$allowAnonymous} />
				{$_('config.client.allow_anonymous')}
			</label>
			<Box level="info">
				{$_('config.client.allow_anonymous_help')}
			</Box>
			<label>
				<input type="checkbox" bind:checked={$allowMULPU} />
				{$_('config.client.allow_mulpu')}
			</label>
			<Box level="info">
				{$_('config.client.allow_mulpu_help')}
			</Box>
			<label>
				<input type="checkbox" bind:checked={$devOauth} />
				{$_('config.client.dev_oauth')}
			</label>
			<Box level="info">
				{$_('config.client.dev_oauth_help')}
			</Box>
			<input type="button" on:click={reset} value={$_('config.client.reset')} />
			<Box level="info">
				{$_('config.client.reset_help')}
			</Box>
			<h2>{$_('config.client.etc')}</h2>
			<label>
				{$_('config.client.api_base_url')}
				<input type="url" value={client.baseUrl.toString()} disabled />
			</label>
			<br />
			<label>
				{$_('config.client.paimon_base_url')}
				<input type="url" value={import.meta.env.VITE_PAIMON_BASE_URL.toString()} disabled />
			</label>
			<br />
			<LangSelect />
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
		.light {
			display: none;
		}
		.dark {
			display: initial;
		}
	}
	@media (prefers-color-scheme: light) {
		.light {
			display: initial;
		}
		.dark {
			display: none;
		}
	}
</style>
