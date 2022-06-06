<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { client } from '$lib/api2';
	import { browser } from "$app/env";
	
	export let uid: string;
	export let name: string;
	export let slug: string;

	if (!name && browser) {
		client.user(uid).then(user => {
			name = user.name;
			slug = user.slug;
		});
	}
</script>

{#if uid}
<img
	alt={$_('iori.user.profile')}
	src={new URL(`api/v2/user/${uid}/img`, client.baseUrl).toString()}
/>
<a href="/user/{uid}">
	{name}
	(<code>{slug}</code>)
</a>
{:else}
<a href="/user/anonymous">
	<em>{$_('iori.anonymous')}</em>
</a>
{/if}
