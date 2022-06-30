<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Box from '$lib/Box.svelte'
	import type { OClient } from '$lib/api2'

	export let ocl: OClient
</script>

<h2>{$_({ id: 'oclient.title', values: { name: ocl.name } })}</h2>
<div class="oclient flex">
	<div class="left">
		<img alt={$_('oclient.logo')} class="user-img" src={ocl.logo_uri} />
		Author: <a href={`/user?uid=${ocl.user_id}`}>{ocl.user_name}</a>
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
	}
	.links {
		display: flex;
		flex-direction: column;
	}
</style>
