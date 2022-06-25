<script lang="ts" type="module">
	import { page } from '$app/stores'
	import { client } from '$lib/api2'
	import { browser } from '$app/env'
	import Scope from '$lib/Scope.svelte'
	import Box from '$lib/Box.svelte'
	import type { Grant } from '$lib/api2'
	import { ulos, currentUlid } from '$lib/api2'

	let ulo = $ulos.get($currentUlid)

	let csrfToken: string
	let grant: Grant | null
	;(async () => {
		if (browser) {
			if (!(await client.loggedIn()))
				window.location.replace(
					`/iori?selfnext=${encodeURIComponent(
						window.location.pathname
					)}&selfargs=${encodeURIComponent(window.location.search.slice(1))}`
				)

			csrfToken = await client.getCsrfToken()
			const azrqid = $page.url.searchParams.get('azrqid')
			console.log(`AzRqID: ${azrqid}`)
			grant = await client.getAzrq(azrqid)
		}
	})()
</script>

<svelte:head>
	<title>Authorize</title>
</svelte:head>

<main>
	{#if grant === undefined}
		Loading
	{:else if grant === null}
		<Box level="error">Grant already used (may be authorized or denied).</Box>
		<Box level="info">
			If you want to retry, you may want to <input
				type="button"
				on:click={() => history.back()}
				value="go back"
			/> (again).
		</Box>
	{:else}
		<p>
			<a href={grant.client.uri}>{grant.client.name}</a>
			by <a href={`/user?uid=${grant.client.user_id}`}>{grant.client.user_name}</a>
			is requesting access to your
			<a href={`/user?uid=${ulo.uid}`}>{ulo.name}</a>
			account.
		</p>
		If you allow, it will have access to:
		<ul>
			{#each grant.request.scope.split(' ') as scope}
				{#if scope === "openid"}
					<li>Your user ID (i.e. {ulo.uid}) (via OpenID Connect's <code>sub</code>)</li>
				{:else}
					<li><Scope name={scope} /></li>
				{/if}
			{/each}
		</ul>
		<Box level="debug">
			Grant: <pre>{JSON.stringify(grant, null, 2)}</pre>
		</Box>
		<form
			action="{client.baseUrl}/oauth/authorize?{new URLSearchParams(grant.args).toString()}"
			method="post"
		>
			<input type="hidden" name="_csrf_token" value={csrfToken} />
			<input class="update" type="submit" name="action_allow" value="Allow" />
			<input class="delete" type="submit" name="action_deny" value="Deny" />
		</form>
	{/if}
</main>
