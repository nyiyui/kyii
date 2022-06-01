<script lang="ts" type="modue">
	import User from '$lib/iori/User.svelte';
	import { browser } from '$app/env';
	import { client } from '$lib/api2';

	let uid: string | null = browser ? client.currentUid : undefined;
	let name: string;
	let slug: string;
	if (browser) {
		if (client.currentUlo && client.currentUlo !== "anonymous") {
			name = client.currentUlo.name;
			slug = client.currentUlo.slug;
		} else {
			uid = null;
			name = null;
			slug = null;
		}
	}
</script>

<User {uid} {name} {slug} />
