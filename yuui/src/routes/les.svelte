<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { client, Handler } from '$lib/api2'
	import type { LogEntry } from '$lib/api2'
	// import { onMount } from 'svelte'
	import type { UUID } from 'uuid'
	import GenericLogEntryView from '$lib/generic/LogEntryView.svelte'
	import List from '$lib/generic/List.svelte'

	type R = UUID
	type V = LogEntry

	let handler: Handler<R, V>
	handler = new Handler(client, 'le')
</script>

<svelte:head>
	<title>{$_('header.les')}</title>
</svelte:head>

<main class="les">
	<List {handler} renderer={GenericLogEntryView} />
</main>
