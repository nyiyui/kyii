<script lang="ts" type="module">
	import { browser } from '$app/env';
	import { Client } from '../lib/api';
	import type { Status } from '../lib/api';

	let client: Client;

	let s: Status;
	(async () => {
		if (browser) {
			client = new Client();
			s = await client.status();
		}
	})()
</script>

<svelte:head>
	<title>Kyii Client</title>
</svelte:head>

<main>
	{JSON.stringify(s)}
</main>
