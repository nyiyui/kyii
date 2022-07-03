<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { debugMode } from '$lib/store'
	import Icon from '@iconify/svelte'
	import Box from '$lib/Box.svelte'

	export let verifier: string

	function getUrl(verifier: string): URL {
		return new URL(
			`/authn/afs/${encodeURI(verifier)}.html`,
			import.meta.env.VITE_PAIMON_BASE_URL as string
		)
	}

	const url = getUrl(verifier).toString()
</script>

{#if verifier === null}
	<em>Not Set</em>
{:else}
	<a href={url}>
		{#if verifier === 'pw'}
			<Icon icon="mdi:dialpad" />
			{$_('af.pw.label')}
		{:else if verifier === 'otp_totp'}
			<Icon icon="mdi:clock-outline" />
			{$_('af.otp_totp.label')}
		{:else if verifier === 'webauthn'}
			<icon icon="mdi:key" />
			{$_('af.webauthn.label')}
		{:else if verifier === 'limited'}
			<Icon icon="mdi:timer-outline" />
			{$_('af.limited.label')}
		{:else if verifier === 'remote'}
			<Icon icon="mdi:devices" />
			{$_('af.remote.label')}
		{:else if verifier === 'ctrl_email' && $debugMode}
			<Icon icon="mdi:at" />
			Control of Email Address (TODO)
		{:else if verifier === 'ctrl_tel' && $debugMode}
			<Icon icon="mdi:phone" />
			Control of Telephone (TODO)
		{:else if verifier === 'ctrl_pubkey' && $debugMode}
			<Icon icon="mdi:key" />
			Control of Private Key (TODO)
		{:else if verifier === 'ctrl_dns' && $debugMode}
			<Icon icon="mdi:dns-outline" />
			Control of DNS Authority (TODO)
		{:else if verifier === 'ctrl_oidc' && $debugMode}
			<Icon icon="mdi:openid" />
			Control of OpenID Connect End-User (TODO)
		{:else if verifier === 'ctrl_ldap' && $debugMode}
			<Icon icon="mdi:folder-account" />
			Control of LDAP user (TODO)
		{:else}
			<Box level="error">
				Unknown verifier
				{#if $debugMode}
					<code>{verifier}</code>
				{/if}
			</Box>
		{/if}
	</a>
{/if}

<style>
	a {
		font-size: 14px;
	}
</style>
