<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { ulos, currentUlid } from '$lib/api2'

	export let name: string

	let ulo = $ulos.get($currentUlid)
</script>

{#if name === 'openid'}
	<a href="https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims">
		{$_({ id: 'oauth2.sub', values: { uid: ulo.uid } })}
	</a>
{:else}
	{$_(`oauth2.scopes.${name}`)}
{/if}
(<code>{name}</code>)
