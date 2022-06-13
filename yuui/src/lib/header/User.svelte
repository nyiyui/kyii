<script lang="ts" type="modue">
	import User from '$lib/iori/User.svelte'
	import { browser } from '$app/env'
	import { client, currentUlid, ulos } from '$lib/api2'

	let uid: string | null = browser ? client.currentUid : undefined
	let name: string
	let slug: string
	if (browser) {
		if ($currentUlid && $currentUlid !== 'anonymous') {
			const ulo = $ulos.get($currentUlid)
			console.log(ulo, $currentUlid)
			name = ulo.name
			slug = ulo.slug
		} else {
			uid = null
			name = null
			slug = null
		}
	}
</script>

<User {uid} {name} {slug} iconOnly />
