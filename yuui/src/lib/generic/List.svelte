<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Loading from '$lib/Loading.svelte'
	import BoxError from '$lib/BoxError.svelte'
	import type { SvelteComponent } from 'svelte'
	import { onMount } from 'svelte'
	import type { Handler } from '$lib/api2'
	import { Direction } from '$lib/api2'

	type R = $$Generic
	type V = $$Generic

	export let handler: Handler<R, V>
	export let renderer: SvelteComponent
	export let offset = 0
	export let seekLength = 32
	export let seekInterval = seekLength
	export let total: number

	let rCache: R[]

	let error = ''
	enum State {
		Loading,
		Oops,
		Ready
	}
	let state: State = State.Loading

	onMount(reload)

	async function reload() {
		state = State.Loading
		try {
			await Promise.all([
				(async () => {
					rCache = await handler.seek(Direction.Next, offset, seekLength)
				})(),
				(async () => {
					total = await handler.total()
				})()
			])
			state = State.Ready
		} catch (e) {
			state = State.Oops
			error = e.toString()
			throw e
		}
	}

	async function next() {
		offset += seekInterval
		reload()
	}

	async function prev() {
		if (offset === 0) {
			throw new TypeError('0未満のオフセットは出来ないよぉ〜')
		}
		offset -= seekInterval
		reload()
	}
</script>

<div class="generic-list">
	{#if state === State.Loading}
		<Loading />
	{:else if state === State.Oops}
		<BoxError msg={error} passive />
	{:else if state === State.Ready}
		<nav>
			<div class="count">
				{$_(`generics.${handler.name}.seeked`, { values: { seekLength, total } })}
			</div>
			<div class="page">
				{$_('generic.page', { values: { page: offset / seekInterval + 1 } })}
			</div>
			<input type="button" value={$_('generic.prev')} on:click={prev} disabled={offset === 0} />
			<input
				type="button"
				value={$_('generic.next')}
				on:click={next}
				disabled={offset + seekInterval > total}
			/>
			<input type="button" value={$_('generic.reload')} on:click={reload} />
		</nav>
		<div>
			{#each rCache as r}
				<svelte:component this={renderer} {handler} {r} />
			{/each}
		</div>
	{/if}
</div>

<style>
	nav {
		display: flex;
	}

	nav .count {
		flex-grow: 1;
	}
</style>
