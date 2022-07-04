<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Box from '$lib/Box.svelte'
	import type { OClient } from '$lib/api2'

	export let ocl: OClient
	export let name: string
	export let userId: string
	export let userName: string
</script>

<h2>{$_({ id: 'oclient.title', values: { name: ocl.name || name } })}</h2>
<div class="oclient flex">
	<div class="left">
		<img alt={$_('oclient.logo')} class="user-img" src={ocl.logo_uri} />
		<div>
			{$_('oclient.author')}
			<a href={`/user?uid=${ocl.user_id || userId}`}>{ocl.user_name || userName}</a>
		</div>
		<div>
			{$_('oclient.contacts')}
			<ul>
				{#each ocl.contacts as contact}
					<li>{contact}</li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="links flex-in">
		<h3>{$_('oclient.links')}</h3>
		<a href={ocl.policy_uri}>{$_('oclient.policy_uri')}</a>
		<a href={ocl.tos_uri}>{$_('oclient.tos_uri')}</a>
		<a href={ocl.uri}>{$_('oclient.client_uri')}</a>
	</div>
</div>
<Box level="debug">
	{JSON.stringify(ocl)}
</Box>

<style>
	.oclient .left {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}

	.links {
		display: flex;
		flex-direction: column;
	}
</style>
