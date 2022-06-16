<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { client } from '$lib/api2'

	export let uid: string
	export let name: string
	export let slug: string
	export let iconOnly = false
</script>

{#if uid == 'anonymous' || uid === null}
	<span class="user">
		<em>{$_('iori.anonymous')}</em>
	</span>
{:else}
	<span class="user">
		<img
			alt={$_('iori.user.profile')}
			class="user-img"
			src={new URL(`api/v2/user/${uid}/img`, client.baseUrl).toString()}
		/>
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
