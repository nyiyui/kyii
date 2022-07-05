<script lang="ts" type="module">
	import Loading from '$lib/Loading.svelte'
	import BoxError from '$lib/BoxError.svelte'
	import { client, forceLogin } from '$lib/api2'
	import { onMount } from 'svelte'
	import type { UserLogin } from '$lib/api2'
	import UserLoginInput from '$lib/UserLoginInput.svelte'

	let uls: Promise<Array<UserLogin>>

	function reload() {
		uls = client.ulsList()
	}

	onMount(async () => {
		await forceLogin()
		reload()
	})
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
