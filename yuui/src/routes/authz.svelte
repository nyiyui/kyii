<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { page } from '$app/stores'
	import { client } from '$lib/api2'
	import { browser } from '$app/env'
	import Loading from '$lib/Loading.svelte'
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
	<title>{$_('authz.title')}</title>
</svelte:head>

<main>
	<h1>{$_('authz.title')}</h1>
	{#if grant === undefined}
		<Loading />
	{:else if grant === null}
		<Box level="error">{$_('authz.already_used')}</Box>
		<Box level="info">
			{$_('authz.retry')}
			<input type="button" on:click={() => history.back()} value={$_('authz.go_back')} />.
		</Box>
	{:else}
		<p>
			{$_({ id: 'authz.prompt', values: { user_name: ulo.name } })}
			<br />
			{$_('authz.client_lhs')}
			<a href="/oclient?oclid={grant.args.client_id}">{grant.client.name}</a>
		</p>
		{$_('authz.then')}
		<ul>
			{#each grant.request.scope.split(' ') as scope}
				<li><Scope name={scope} /></li>
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
			<input class="update" type="submit" name="action_allow" value={$_('authz.allow')} />
			<input class="delete" type="submit" name="action_deny" value={$_('authz.deny')} />
		</form>
	{/if}
</main>
