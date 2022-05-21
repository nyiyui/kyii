<script lang="ts" type="module">
	import { debugMode } from '$lib/store';
	import Icon from '@iconify/svelte';
	import Box from '$lib/Box.svelte';

	export let verifier: string;

	function getUrl(verifier: string): URL {
		return new URL(`/authn/afs/${encodeURI(verifier)}.html`,import.meta.env.VITE_PAIMON_BASE_URL as string);
	}

	const url = getUrl(verifier).toString();
</script>

{#if verifier === null}
	<em>Not Set</em>
{:else}
	<a href={url}>
	{#if verifier === "pw"}
		<Icon icon="mdi:dialpad" />
		Password
	{:else if verifier === "otp_totp"}
		<Icon icon="mdi:clock-outline" />
		TOTP
	{:else if verifier === "ctrl_email" && $debugMode}
		<Icon icon="mdi:at" />
		Control of Email Address
		(TODO)
	{:else if verifier === "ctrl_tel" && $debugMode}
		<Icon icon="mdi:phone" />
		Control of Telephone
		(TODO)
	{:else if verifier === "ctrl_pubkey" && $debugMode}
		<Icon icon="mdi:key" />
		Control of Private Key
		(TODO)
	{:else if verifier === "ctrl_dns" && $debugMode}
		<Icon icon="mdi:dns-outline" />
		Control of DNS Authority
		(TODO)
	{:else if verifier === "ctrl_oidc" && $debugMode}
		<Icon icon="mdi:openid" />
		Control of OpenID Connect End-User
		(TODO)
	{:else if verifier === "ctrl_ldap" && $debugMode}
		<Icon icon="mdi:folder-account" />
		Control of LDAP user
		(TODO)
	{:else if verifier === "webauthn" && $debugMode}
		<Icon icon="mdi:key" />
		WebAuthn
		(TODO)
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
