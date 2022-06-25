<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Box from '$lib/Box.svelte'

	export let list: Array<string>
</script>

<div class="list-input outline flex">
	{#each [...list.entries()].map(a => a[0]) as i}
		<div class="flex-in">
			<input type="text" bind:value={list[i]} />
			<input class="delete" type="button" value={$_('list_input.delete')} on:click={() => {list.splice(i, i); list = list}} />
		</div>
	{/each}
	<div class="flex-in">
		<input class="new" type="button" value={$_('list_input.new')} on:click={() => {list.push(''); list = list}} disabled={list[list.length-1] === ''} />
	</div>
	<Box level="debug">{JSON.stringify(list)}</Box>
</div>

<style>
	.list-input {
		flex-direction: column;
	}
</style>
