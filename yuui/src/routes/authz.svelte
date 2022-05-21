<script lang="ts" type="module">
	import { page } from '$app/stores';
	import { Client } from "../lib/api";
	import { browser } from "$app/env";
	import Icon from '@iconify/svelte';

	let client: Client;

	type Grant = {
		args: any,
		client: {
			user_id: string,
			name: string,
			uri: string,
		},
		request: {
			response_type: string,
			redirect_uri: string,
			scope: string,
			state: string,
		},
	};

	let csrfToken: string;

	const grant: Grant = JSON.parse($page.url.searchParams.get('grant'));
	(async () => {
		if (browser) {
			client = new Client();
			// not using export function get in *.ts because it didn't work for moi…maybe a TODO: fix this?
			const s = await client.status();
			if (s === null)
				window.location.replace(`/login?selfnext=${encodeURIComponent(window.location.pathname)}&selfargs=${encodeURIComponent(window.location.search.slice(1))}`);

			csrfToken = await client.getCsrfToken();
		}
	})();
</script>

<main>
	<a href="{grant.client.uri}">{grant.client.name}</a> is requesting:
	<ul>
		{#each grant.request.scope.split(' ') as scope}
			<li><code>{scope}</code></li>
		{/each}
	</ul>
	<form action="{import.meta.env.VITE_API_BASE_URL}/oauth/authorize?{new URLSearchParams(grant.args).toString()}" method="post">
		<input type="hidden" name="_csrf_token" value="{csrfToken}" />
		<input type="submit" name="action_allow" value="Allow" />
		<input type="submit" name="action_deny" value="Deny" />
	</form>
</main>
