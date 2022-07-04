<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Box from '$lib/Box.svelte'
	import { page } from '$app/stores'
	import { client } from '$lib/api2'
	import { onMount } from 'svelte'

	let token = ''

	async function decide() {
		await client.remoteDecide(token)
		token = ''
	}

	onMount(async () => {
		if (!(await client.loggedIn())) {
			console.log('not logged in; cannot logout')
			window.location.replace('/login')
		}
		token = $page.url.searchParams.get('token')
	})
</script>

<svelte:head>
	<title>{$_('remote-decide.title')}</title>
</svelte:head>

<main>
	<h1>{$_('remote-decide.title')}</h1>
	<Box level="warn">
		{$_('remote-decide.warn')}
	</Box>
	<form>
		<label>
			{$_('remote-decide.token_label')}
			<input
				type="text"
				inputmode="numeric"
				bind:value={token}
				autocomplete="one-time-code"
				pattern={'[0-9]{6}'}
			/>
		</label>
		<input class="warn" type="button" value={$_('remote-decide.button_value')} on:click={decide} />
	</form>
</main>
