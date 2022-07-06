<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { ulos as ulosStore, currentUlid } from '$lib/api2'
	import Loading from '$lib/Loading.svelte'
	import Box from '$lib/Box.svelte'
	import User from '$lib/iori/User.svelte'
	import LogEntry from '$lib/LogEntry.svelte'

	let ulo = $ulosStore.get($currentUlid)
</script>

<main>
	{#if $currentUlid === 'anonymous'}
		<Box level="info">
			{@html $_('index.login_pls')}
		</Box>
	{:else}
		{$_('index.logged_in_as')}
		{#if ulo}
			<User uid={ulo.uid} name={ulo.name} slug={ulo.slug} />
		{/if}
	{/if}
</main>
