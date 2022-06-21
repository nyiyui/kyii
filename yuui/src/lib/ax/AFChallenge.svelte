<script lang="ts" type="module">
	// TODO: callback → event dispatch
	import { _ } from 'svelte-i18n'
	import Icon from '@iconify/svelte'
	import AF from '$lib/ax/AF.svelte'
	import Box from '$lib/Box.svelte'
	import BoxError from '$lib/BoxError.svelte'
	import type { AfPublic } from '$lib/api2'
	import { AttemptResultStatus } from '$lib/util'
	import { client } from '$lib/api2'

	export let af: AfPublic
	export let attempt: string
	export let callback: (afid: string, attempt: string) => Promise<any>
	export let result: { status: AttemptResultStatus; msg?: string; feedback?: string }

	let solved: boolean
	$: solved = result && result.status === AttemptResultStatus.Success

	async function webauthnSubmit() {
		const feedback = await callback(af.uuid, JSON.stringify({ state: '1_generate' }))
		const assertion = await navigator.credentials.get(feedback)
		console.log('webauthn assertion', assertion)
		await callback(af.uuid, JSON.stringify({ state: '2_verify', assertion }))
	}

	async function autoAttempt() {
		if (af.verifier === 'otp_totp') {
			if (attempt && attempt.length === af.public_params.digits) {
				await callback(af.uuid, attempt)
				if (result.status === AttemptResultStatus.Fail) {
					attempt = ''
				}
			}
		}
	}

	$: {
		attempt
		autoAttempt()
	}
</script>

<div class="af-challenge">
	<div class="left">
		<div class="name">
			{af.name}
		</div>
		<div class="verifier">
			<AF verifier={af.verifier} />
		</div>
	</div>
	<div class="right">
		<div class="challenge">
			{#if af.verifier === 'pw'}
				<label id={af.uuid} class="af">
					{$_('af.pw.pw')}
					<input type="password" bind:value={attempt} autocomplete="current-password" />
				</label>
				<input
					type="button"
					value={$_('af.submit')}
					disabled={!attempt || solved}
					on:click={() => callback(af.uuid, attempt)}
				/>
			{:else if af.verifier === 'otp_totp'}
				<label id={af.uuid} class="af">
					{$_('af.otp_totp.label')}
					<input
						type="text"
						inputmode="numeric"
						bind:value={attempt}
						autocomplete="one-time-code"
						pattern="[0-9]*"
					/>
				</label>
			{:else if af.verifier === 'limited'}
				<input
					type="button"
					value={$_('af.submit')}
					on:click={() => callback(af.uuid, attempt)}
					disabled={solved}
				/>
			{:else if af.verifier === 'webauthn'}
				<input type="button" value={$_('af.submit')} on:click={webauthnSubmit} disabled={solved} />
			{/if}
		</div>
		<div class="result">
			{#if result === undefined}
				<Icon icon="mdi:checkbox-blank-circle-outline" style="color: var(--color-neutral);" />
			{:else}
				{#if result.status === AttemptResultStatus.Success}
					<BoxError msg={null} />
				{:else if result.status === AttemptResultStatus.Fail}
					<Box level="error">
						fail: {result.msg}
					</Box>
				{:else if result.status === AttemptResultStatus.Error}
					<Box level="error">
						error: {result.msg}
					</Box>
				{:else}
					<Box level="error">
						unexpected: {result.msg}
					</Box>
				{/if}
				<Box level="debug">
					Feedback: {JSON.stringify(result.feedback)}
				</Box>
				{#if result.feedback}
					{#if af.verifier === 'limited'}
						Remaining: {result.feedback.remaining}
					{/if}
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
	.af-challenge {
		display: flex;
	}
	@media screen and (max-width: 600px) {
		.af-challenge {
			flex-direction: column;
		}
	}
	.af-challenge > div {
		flex: 50%;
	}
	.verifier {
		font-size: 14px;
	}
	.right {
		text-align: right;
	}
</style>
