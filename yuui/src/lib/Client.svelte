<script lang="ts" type="module">
	import type { Client } from '$lib/api2'

	export let client: Client
</script>

<a href="/oclient?oclid={client.client_id}">{client.name}</a> by
<a href="/user?uid={client.user_id}">{client.user_name}</a>
