<script lang="ts" type="module">
	import Select from 'svelte-select'
	import Public from '$lib/Public.svelte'
	import Private from '$lib/Private.svelte'
	import ListInput from '$lib/ListInput.svelte'
	import ListSelect from '$lib/ListSelect.svelte'
	import { _ } from 'svelte-i18n'
	import Loading from '$lib/Loading.svelte'
	import BoxError from '$lib/BoxError.svelte'
	import Box from '$lib/Box.svelte'
	import UnsavedChanges from '$lib/UnsavedChanges.svelte'
	import { client } from '$lib/api2'
	import type { OClient2, OClient2Input } from '$lib/api2'
	import { createEventDispatcher } from 'svelte'
	import { onMount } from 'svelte'

	const dispatch = createEventDispatcher()

	export let oclient: OClient2
	let unsavedChanges = false
	$: unsavedChanges = (oclient.client_name || '') !== (newName || '')
	let newName: string | null = oclient.client_name || null
	let nameSpan: HTMLSpanElement

	let token_endpoint_auth_method = { value: oclient.token_endpoint_auth_method, label: oclient.token_endpoint_auth_method }
	$: oclient.token_endpoint_auth_method = token_endpoint_auth_method.value

	let response_types = oclient.response_types.map(type_ => ({ value: type_, label: type_ }))
	$: oclient.response_types = response_types.map(pair => pair.value)

	let error: string

	async function remove() {
		try {
			await client.oclientDelete(oclient.id)
			dispatch('reload')
		} catch (err) {
			error = err
		}
	}

	let preparedOclient2: OClient2Input;
	$: preparedOclient2 = {
		...oclient,
		client_name: newName,
	}

	async function update() {
		try {
			await client.oclientEdit(oclient.id, preparedOclient2)
			error = ''
		} catch(e) {
			error = e.toString()
		}
		oclient = oclient
	}

	let oidcConfig;

	onMount(async () => {
		const url = new URL(`.well-known/openid-configuration`, client.baseUrl)
		oidcConfig = await (await fetch(url.toString())).json()
	})
</script>

{#if !oidcConfig}
	<Loading />
{:else}
	<section class="oclient panel flex flex-column" id={oclient.id}>
		<div class="meta flex flex-row">
			<h2>
				<span contenteditable="true" bind:textContent={newName} bind:this={nameSpan} />
				{#if !newName}
					<em on:click={nameSpan.focus()}>
						{$_('untitled')}
					</em>
				{/if}
				{#if unsavedChanges}
					<UnsavedChanges />
				{/if}
			</h2>
			<div class="action">
				<input
					class="delete"
					type="button"
					value={$_('oclient.delete')}
					on:click={remove}
				/>
				<input class="update" type="button" value={$_('oclient.update')} on:click={update} />
				<BoxError msg={error} passive />
			</div>
		</div>
		<div class="content flex">
			<div class="padded flex-in">
				<h3>{$_('oclient.meta')}</h3>
				<label>
					{$_('oclient.id')}
					<input type="text" value={oclient.id} disabled />
				</label>
				<br />
				<label>
					{$_('oclient.client_id')}
					<input type="text" value={oclient.client_id} disabled />
				</label>
				<br />
				<label>
					{$_('oclient.client_id_issued_at')}
					<input type="text" value={oclient.client_id_issued_at} disabled />
				</label>
				<br />
				<label>
					{$_('oclient.client_secret')}
					<input type="text" value={oclient.client_secret} disabled />
				</label>
				<br />
				<label>
					{$_('oclient.client_secret_expires_at')}
					<input type="text" value={oclient.client_secret_expires_at} disabled />
				</label>
			</div>
			<div class="padded flex-in">
				<h3>{$_('oclient.oauth')}</h3>
				{$_('oclient.redirect_uris')}
				<Private />
				<ListInput bind:list={oclient.redirect_uris} />
				<br />
				{$_('oclient.token_endpoint_auth_method')}
				<Private />
				<Select
					items={oidcConfig.token_endpoint_auth_methods_supported.map(method => ({ value: method, label: method }))}
					bind:value={token_endpoint_auth_method}
				/>
				<Box level="info">
					{#if oidcConfig}
						{JSON.stringify(oidcConfig.token_endpoint_auth_methods_supported)}
					{/if}
				</Box>
				{$_('oclient.grant_types')}
				<Private />
				<ListInput bind:list={oclient.grant_types} />
				<br />
				{$_('oclient.response_types')}
				<Private />
				<ListSelect bind:list={response_types} items={oidcConfig.response_types_supported.map(type_ => ({ value: type_, label: type_ }))} />
				<Box level="info">
					{#if oidcConfig}
						{JSON.stringify(oidcConfig.response_types_supported)}
					{/if}
				</Box>
				<br />
				<label>
					{$_('oclient.scope')}
					<Private />
					<input type="text" bind:value={oclient.scope} />
				</label>
				<br />
				<label>
					{$_('oclient.jwks_uri')}
					<input type="text" bind:value={oclient.jwks_uri} />
				</label>
				<br />
				{$_('oclient.jwks')}
				<ListInput bind:list={oclient.jwks} />
			</div>
			<div class="padded flex-in">
				<h3>{$_('oclient.identity')}</h3>
				<label>
					{$_('oclient.client_name')}
					<Public />
					<input type="text" bind:value={newName} />
				</label>
				<br />
				<label>
					{$_('oclient.client_uri')}
					<Public />
					<input type="text" bind:value={oclient.client_uri} />
				</label>
				<br />
				<label>
					{$_('oclient.logo_uri')}
					<Public />
					<input type="text" bind:value={oclient.logo_uri} />
				</label>
				<!-- TODO: upload image for logo -->
				<br />
				{$_('oclient.contacts')}
				<Public />
				<ListInput bind:list={oclient.contacts} />
				<br />
				<label>
					{$_('oclient.tos_uri')}
					<Public />
					<input type="text" bind:value={oclient.tos_uri} />
				</label>
				<br />
				<label>
					{$_('oclient.policy_uri')}
					<Public />
					<input type="text" bind:value={oclient.policy_uri} />
				</label>
				<br />
				<label>
					{$_('oclient.software_id')}
					<input type="text" bind:value={oclient.software_id} />
				</label>
				<br />
				<label>
					{$_('oclient.software_version')}
					<input type="text" bind:value={oclient.software_version} />
				</label>
			</div>
			<Box level="debug">
				<pre>{JSON.stringify(oclient, null, 2)}</pre>
			</Box>
			<Box level="debug">
				<pre>{JSON.stringify(preparedOclient2, null, 2)}</pre>
			</Box>
		</div>
	</section>
{/if}

<style>
	.meta > h2 {
		flex-grow: 1;
	}

	.meta > .action {
		align-self: flex-end;
	}
</style>

