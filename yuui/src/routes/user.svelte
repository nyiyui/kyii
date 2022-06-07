<script lang="ts" type="module">
	import User from '$lib/iori/User.svelte';
	import Loading from '$lib/Loading.svelte';
	import Box from '$lib/Box.svelte';
	import { _ } from 'svelte-i18n'
	import { page } from '$app/stores';
	import { client } from '$lib/api2';

	const params = $page.url.searchParams;
	const uid = params.get('uid');
</script>

{#if !params.has('uid')}
	<Box level="error">{$_('user.no_uid')}</Box>
{:else}
	{#await client.user(uid)}
		<Loading />
	{:then user}
		{#if user}
			<User uid={uid} name={user.name} slug={user.slug} load={false} />
		{:else}
			<Box level="error">{$_('user.not_found')}</Box>
		{/if}
	{:catch err}
		<Box level="error">{$_('user.error', { values: { error: err.toString() } })}</Box>
	{/await}
{/if}
