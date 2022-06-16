<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { client } from '$lib/api2'
	import Icon from '@iconify/svelte'
	import { onMount } from 'svelte'

	export let uid: string
	export let name: string
	export let slug: string
	export let iconOnly = false
	let iconFound = true

	onMount(async() => {
		const url = new URL(`api/v2/user/${uid}/img`, client.baseUrl)
		const r = await fetch(url.toString())
		iconFound = r.status !== 404
		console.log(`iconFound`, iconFound);
	})

	// TODO: optimize to only one fetch
</script>

{#if uid == 'anonymous' || uid === null}
	<span class="user">
		<em>{$_('iori.anonymous')}</em>
	</span>
{:else}
	<span class="user">
		{#if iconFound}
			<img
				alt={$_('iori.user.profile')}
				class="user-img"
				src={new URL(`api/v2/user/${uid}/img`, client.baseUrl).toString()}
			/>
		{:else}
			<Icon icon="mdi:account-circle" class="user-img" />
		{/if}
		{#if !iconOnly}
			<div class="non-img">
				<div class="name">{name}</div>
				<div class="slug"><code>{slug}</code></div>
			</div>
		{/if}
	</span>
{/if}

<style>
	.user {
		display: flex;
	}

	.user .non-img {
		padding-left: 8px;
	}

	.non-img {
		display: flex;
		flex-direction: column;
	}
</style>
