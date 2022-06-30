<script lang="ts" type="module">
	import Select from 'svelte-select'
	import { _ } from 'svelte-i18n'
	import Box from '$lib/Box.svelte'

	export let list: Array<{ value: string; label: string }>
	export let items: Array<{ value: string; label: string }>
</script>

<div class="list-select outline">
	{#each [...list.entries()].map((a) => a[0]) as i}
		<div class="flex-in">
			<Select {items} bind:value={list[i]} />
			<input
				class="delete"
				type="button"
				value={$_('list_input.delete')}
				on:click={() => {
					list.splice(i, i)
					list = list
				}}
			/>
		</div>
	{/each}
	<div class="flex-in">
		<input
			class="new"
			type="button"
			value={$_('list_input.new')}
			on:click={() => {
				list.push('')
				list = list
			}}
			disabled={list[list.length - 1] === ''}
		/>
	</div>
	<Box level="debug">{JSON.stringify(list)}</Box>
</div>

<style>
	.list-select {
		flex-direction: column;
	}
</style>
