<script lang="ts" type="module">
	import type { Client } from '$lib/api2'

	export let client: Client
</script>

<a href={client.uri}>{client.name}</a> by
<a href="/user?uid={client.user_id}"><code>{client.user_id}</code></a>
