<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { client, forceLogin } from '$lib/api2'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'

	onMount(forceLogin)

	async function logout() {
		await client.logout()
		goto('/')
	}
</script>

<svelte:head>
	<title>{$_('logout.logout')}</title>
</svelte:head>

<main class="logout">
	<input type="button" value={$_('logout.logout')} on:click={logout} />
</main>
