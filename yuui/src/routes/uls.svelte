<script lang="ts" type="module">
	import Loading from '$lib/Loading.svelte'
	import BoxError from '$lib/BoxError.svelte'
	import { client } from '$lib/api2'
	import type { UserLogin } from '$lib/api2'
	import { browser } from '$app/env'
	import UserLoginInput from '$lib/UserLoginInput.svelte'

	let uls: Promise<Array<UserLogin>>

	function reload() {
		uls = client.ulsList()
	}

	(async () => {
		if (browser) {
			if (!(await client.loggedIn())) {
				console.log('not logged in')
				window.location.replace('/login')
			}

			reload();
		}
	})()
</script>

<svelte:head>
	<title>Sessions</title>
</svelte:head>

<main class="logout">
	<input type="button" value="Reload" on:click={reload} />
	{#if uls}
		{#await uls}
			<Loading />
		{:then uls}
			{#each Array.from(uls.entries()) as [i, ul]}
				<UserLoginInput
					bind:ul
					{client}
					on:delete={() => {
						uls.splice(i, 1)
						uls = uls
					}}
				/>
			{/each}
		{:catch e}
			<BoxError msg={e} passive />
		{/await}
	{/if}
</main>
