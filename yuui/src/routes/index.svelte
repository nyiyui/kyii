<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { ulos as ulosStore, currentUlid } from '$lib/api2'
	import User from '$lib/iori/User.svelte'

	let ulo = $ulosStore.get($currentUlid)
</script>

<svelte:head>
	<title>Yuui</title>
</svelte:head>

<main>
	{$_('index.logged_in_as')}
	{#if ulo}
		<User
			uid={ulo.uid}
			name={ulo.name}
			slug={ulo.slug}
		/>
	{/if}
</main>
