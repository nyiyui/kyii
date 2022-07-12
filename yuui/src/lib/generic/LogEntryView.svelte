<script lang="ts" type="module">
	import { _, time } from 'svelte-i18n'
	import Box from '$lib/Box.svelte'
	import type { Handler, LogEntry } from '$lib/api2'
	import { timeOpts } from '$lib/util'
	import type { UUID } from 'uuid'

	type R = UUID
	type V = LogEntry

	export let r: R
	export let handler: Handler<R, V>

	let le: LogEntry
	$: handler.deref(r).then((v) => (le = v))

	function getLevel(le: LogEntry) {
		if (['login'].includes(le.renderer)) {
			return 'warn'
		}
		return 'info'
	}

	let level: string

	$: level = le ? getLevel(le) : undefined
</script>

<div class="log-entry flex">
	{#if le}
		<div class="left">
			<Box {level}>
				{$time(new Date(le.created), timeOpts)}
			</Box>
		</div>
		<div class="right">
			{#if le.renderer === 'login'}
				{$_({ id: 'le.login.desc', values: { ulid: le.data.ul } })}
			{:else if le.renderer === 'login_start'}
				{$_({ id: 'le.login_start.desc', values: le.data.extra })}
			{:else if le.renderer === 'login_attempt'}
				<Box level={le.data.cur_done ? 'ok' : 'error'}>
					{$_({ id: 'le.login_attempt.' + le.data.cur_done, values: le.data })}
				</Box>
			{:else if le.renderer === 'login_choose'}
				{$_({ id: 'le.login_choose.desc', values: le.data })}
			{:else if le.renderer === 'remote'}
				{$_({ id: 'le.remote.desc', values: le.data })}
			{:else}
				<code>{JSON.stringify(le)}</code>
			{/if}
		</div>
		<Box level="debug">
			{JSON.stringify(le)}
		</Box>
	{/if}
</div>

<style>
	.log-entry .left {
		flex-grow: 1;
		display: flex;
		flex-direction: row;
	}
</style>
