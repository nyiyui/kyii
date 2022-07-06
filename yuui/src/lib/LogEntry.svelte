<script lang="ts" type="module">
	import { _, time } from 'svelte-i18n'
	import Box from '$lib/Box.svelte'
	import type { LogEntry } from '$lib/api2'

	export let le: LogEntry
</script>

<div class="log-entry flex">
	<div class="left">
		{$time(le.created)}
	</div>
	<div class="right">
		{#if le.renderer === 'login'}
			{$_({ id: 'le.login.desc', values: { ulid: le.data.ul } })}
		{:else if le.renderer === 'remote'}
			{$_({ id: 'le.remote.desc', values: le.data })}
		{:else}
			<code>{JSON.stringify(le)}</code>
		{/if}
	</div>
</div>
<Box level="debug">
	{JSON.stringify(le)}
</Box>

<style>
	.log-entry .left {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}
</style>
