<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import User from '$lib/iori/User.svelte'
	import BoxError from '$lib/BoxError.svelte'
	import Box from '$lib/Box.svelte'
	import { createEventDispatcher } from 'svelte'
	import type { LooseULO } from '$lib/api2'
	import { client, ulos } from '$lib/api2'
	import { debugMode, allowAnonymous } from '$lib/store'

	const dispatch = createEventDispatcher()

	export let ulo: LooseULO
	export let chosen: boolean

	let err: Error | null = null

	async function logout() {
		if (ulo === 'anonymous') throw new TypeError('cannot logout from anonymous user')
		if ($ulos.has(ulo.ulid)) {
			const c = client.uloWith(ulo.ulid)
			try {
				await c.logout()
				client.uloDel(ulo.ulid)
				if (chosen) {
					// switch to anonymous to avoid undefined behaviour (lol)
					client.uloReset();
				}
				dispatch('reload')
			} catch (e) {
				err = e
			}
		} else {
			console.warn(`unknown ulo ${ulo.ulid}; ignoring`);
			client.uloDel(ulo.ulid)
			dispatch('reload')
		}
	}

	function forget() {
		if (ulo === 'anonymous') throw new TypeError('cannot forget anonymous user')
		client.uloDel(ulo.ulid)
		dispatch('reload')
	}
</script>

<div class="ulo" class:outline={chosen}>
	<div class="user">
		{#if ulo === 'anonymous'}
			<User uid="anonymous" name="" slug="" />
		{:else}
			<User uid={ulo.uid} name={ulo.name} slug={ulo.slug} />
		{/if}
	</div>
	<Box level="debug">
		<code>{JSON.stringify(ulo)}</code>
	</Box>
	{#if ulo !== 'anonymous'}
		{#if ulo.invalid}
			<span class="tag invalid">
				{$_('iori.ulo.invalid')}
			</span>
		{/if}
		{#if $debugMode}
			<input
				class="action delete"
				type="button"
				value={$_('iori.ulo.delete')}
				on:click={forget}
				disabled={chosen || !$allowAnonymous}
			/>
		{/if}
		<input
			class="action warn"
			type="button"
			value={$_('iori.ulo.logout')}
			on:click={logout}
			disabled={chosen && ulo.invalid && !$allowAnonymous}
		/>
	{/if}
	<input
		class="action ok"
		type="button"
		value={$_('iori.ulo.choose')}
		on:click={() => dispatch('choose')}
		disabled={chosen || ulo.invalid}
	/>
	<BoxError msg={err ? err.toString() : null} passive />
</div>

<style>
	.action {
		float: right;
	}

	.ulo {
		display: flex;
		align-items: center;
		padding: 8px;
	}

	.user {
		flex-grow: 1;
	}

	.tag.invalid {
		border-color: var(--color-error);
	}
</style>
