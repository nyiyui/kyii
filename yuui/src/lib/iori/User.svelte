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
	let anonymous: boolean

	$: anonymous = uid === 'anonymous' || uid === null

	function fallback() {
		iconFound = false
	}

	// TODO: optimize to only one fetch
</script>

<span class="user">
	{#if iconFound}
		<img
			alt={$_('iori.user.profile')}
			class="user-img"
			src={new URL(`api/v2/user/${uid}/img`, client.baseUrl).toString()}
			on:error={fallback}
		/>
	{:else}
		<Icon icon={anonymous ? 'mdi-incognito-circle' : 'mdi:account-circle'} class="user-img" />
	{/if}
	{#if !iconOnly}
		<div class="non-img">
			<div class="name">{anonymous ? $_('iori.anonymous') : name}</div>
			{#if !anonymous}
				<div class="slug"><code>{slug}</code></div>
			{/if}
		</div>
	{/if}
</span>

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
