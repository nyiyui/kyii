<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { debugMode } from '$lib/store'
	import qrCode from 'qrcode'
	import { newUrl } from '$lib/otp'
	import Icon from '@iconify/svelte'
	import AF from '$lib/ax/AF.svelte'
	import AFChallenge from '$lib/ax/AFChallenge.svelte'
	import type { AfInput } from '$lib/api2'
	import { client, Af, encodeBase64, decodeBase64 } from '$lib/api2'
	import { AttemptResultStatus } from '$lib/util'
	import Box from '$lib/Box.svelte'
	import UnsavedChanges from '$lib/UnsavedChanges.svelte'
	import VerifiedChanges from '$lib/VerifiedChanges.svelte'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let n: number
	export let af: AfInput
	let feedback
	let verifier: string = af.verifier
	export let regen = false
	export let tafid: string | null
	let attempt: string

	let result: {
		status: AttemptResultStatus
		msg?: string
		feedback
	}

	let tafSet = false
	let tafSynched = true
	let tafVerified = false

	async function genTaf(af): Promise<{ feedback; done: boolean }> {
		if (!tafid) {
			tafid = await client.allocTaf()
			console.log(`alloc taf ${tafid}`)
		} else {
			console.log(`already alloc taf ${tafid}`)
		}
		let done: boolean
		;({ feedback, done } = await client.genTaf(tafid, af))
		console.log(`feedback ${feedback}`)
		if (done) {
			tafSet = true
			tafSynched = true
		}
		return { feedback, done }
	}

	async function deallocTaf() {
		if (!tafid) return
		console.log(`dealloc taf ${tafid}`)
		await client.deallocTaf(tafid)
		tafid = null
	}

	async function setRegen() {
		if (af.verifier === 'webauthn') {
			let feedbackRaw
			let done: boolean
			;({ feedback: feedbackRaw, done } = await genTaf({
				...af,
				params: { state: '1_generate' }
			}))
			if (done) {
				throw new TypeError('webauthn unexpected done')
			}
			let feedback = JSON.parse(feedbackRaw)
			feedback = {
				...feedback,
				challenge: decodeBase64(feedback.challenge),
				user: {
					...feedback.user,
					id: decodeBase64(feedback.user.id)
				}
			}
			const credential = (await navigator.credentials.create({
				publicKey: feedback
			})) as PublicKeyCredential // eslint-disable-line no-undef
			const credentialJSON = JSON.stringify({
				id: credential.id,
				rawId: encodeBase64(credential.rawId),
				response: {
					clientDataJSON: encodeBase64(credential.response.clientDataJSON),
					attestationObject: encodeBase64(
						// eslint-disable-next-line no-undef
						(credential.response as AuthenticatorAttestationResponse).attestationObject
					)
				},
				type: credential.type
			})
			;({ feedback, done } = await client.genTaf(
				tafid,
				{
					...af,
					params: {
						state: '2_verify',
						credential: credentialJSON,
						require_user_verification: af.params.require_user_verification || false
					}
				},
				true
			))
			if (!done) {
				throw new TypeError('webauthn unexpected not done')
			}
			tafSet = true
			tafSynched = true
		} else {
			await genTaf(af)
			if (af.verifier === 'otp_totp') loadQr()
			dispatch('reload')
		}
	}

	async function newRegen() {
		regen = true
		updateVerifier()
	}

	async function delRegen() {
		regen = false
		await deallocTaf()
		tafSet = false
		tafSynched = true
		dispatch('reload')
	}

	function tafDesync() {
		tafSynched = false
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function callback(_: string, attempt: string): Promise<any> {
		try {
			if (af.verifier === 'webauthn') {
				let success: boolean
				let msg: string
				let done: boolean
				let verifyFeedback
				;({
					success,
					done,
					msg,
					feedback: verifyFeedback
				} = await client.verifyTaf(tafid, JSON.stringify({ state: '1_generate' })))
				if (done) {
					throw new TypeError('webauthn unexpected done')
				}
				if (!success) {
					throw new TypeError('webauthn unexpected not success: ' + msg)
				}
				let ao = JSON.parse(verifyFeedback)
				ao = {
					...ao,
					challenge: decodeBase64(ao.challenge),
					allowCredentials: ao.allowCredentials.map((c) => ({
						...c,
						id: decodeBase64(c.id)
					}))
				}
				const assertion = (await navigator.credentials.get({
					publicKey: ao
				})) as PublicKeyCredential // eslint-disable-line no-undef
				;({
					success,
					done,
					msg,
					feedback: verifyFeedback
				} = await client.verifyTaf(
					tafid,
					JSON.stringify({ state: '2_verify', credential: JSON.stringify(assertion) })
				))
				if (!done) {
					throw new TypeError('webauthn unexpected not done')
				}
				if (!success) {
					throw new TypeError('webauthn unexpected not success: ' + msg)
				}
				result = {
					status: success ? AttemptResultStatus.Success : AttemptResultStatus.Fail,
					msg,
					feedback: verifyFeedback
				}
				tafVerified = done
				return null
			} else {
				let success: boolean
				let msg: string
				let done: boolean
				let verifyFeedback
				;({ success, done, msg, feedback: verifyFeedback } = await client.verifyTaf(tafid, attempt))
				result = {
					status: success ? AttemptResultStatus.Success : AttemptResultStatus.Fail,
					msg,
					feedback: verifyFeedback
				}
				tafVerified = done
				return verifyFeedback
			}
		} catch (e) {
			console.error('callback error', e)
			result = result || {}
			result.status = AttemptResultStatus.Error
			result.msg = e.toString()
		}
	}

	function updateVerifier() {
		if (verifier === 'pw') {
			af.params = { password: '' }
		} else if (verifier === 'otp_totp') {
			af.params = { digits: 6, period: 30, algorithm: 'SHA1' }
		} else if (verifier === 'limited') {
			af.params = { times: 0 }
		} else {
			//throw new Error(`unknown verifier ${verifier}`);
		}
		af.verifier = verifier
	}

	$: {
		verifier
		try {
			updateVerifier()
		} catch (e) {
			console.log(e)
		}
	}

	//	$: {
	//		if (canvas && feedback !== undefined && af.verifier === "otp_totp") {
	//			loadQr();
	//		}
	//	}

	let canvas: HTMLCanvasElement

	async function loadQr() {
		const s = await client.status()
		const url = newUrl({
			issuer: `Kyii Airy ${client.baseUrl}`,
			user: `${s.user.username}`,
			key: feedback.secret_key,
			algorithm: feedback.algorithm,
			digits: feedback.digits,
			period: feedback.period
		})
		qrCode.toCanvas(canvas, url.toString(), (error) => {
			if (error) console.error(error)
		})
	}
</script>

<div class="af-input" id={af.uuid}>
	<div class="top">
		<h4>
			<span contenteditable="true" bind:textContent={af.name} />
			{#if regen}
				<UnsavedChanges />
				<VerifiedChanges verified={tafVerified} />
			{/if}
		</h4>
		<input
			class="delete"
			type="button"
			on:click={() => dispatch('delete')}
			value={$_('config.delete')}
		/>
	</div>
	<div class="non-top">
		<div class="meta">
			<h5>{$_('config.ax.meta')}</h5>
			<label>
				Verifier
				<!-- (below)TODO: make this like a dropdown or sth -->
				<input type="text" bind:value={verifier} />
			</label>
			<AF verifier={af.verifier} />
			<Box level="debug">
				N: {n}; AFID: {af.uuid}; TAFID: {tafid}
			</Box>
		</div>
		<div class="params">
			<h5>
				{$_('config.ax.params')}
				{#if !tafSynched}
					<UnsavedChanges />
				{/if}
			</h5>
			{#if regen}
				<input class="delete" type="button" value={$_('config.ax.del_taf')} on:click={delRegen} />
				<input type="button" value={$_('config.ax.gen_taf')} on:click={setRegen} />
			{:else}
				<input class="new" type="button" value={$_('config.ax.alloc_taf')} on:click={newRegen} />
			{/if}
			<form>
				{#if af.verifier === 'pw'}
					<label>
						<Icon icon="mdi:dialpad" />
						{$_('af.pw.pw')}
						<input
							type="password"
							bind:value={af.params.password}
							autocomplete="new-password"
							disabled={!regen}
							on:input={tafDesync}
						/>
					</label>
				{:else if af.verifier === 'otp_totp'}
					<label>
						{$_('af.otp_totp.digits')}
						<input
							type="number"
							bind:value={af.params.digits}
							disabled={!regen}
							on:input={tafDesync}
						/>
					</label>
					<label>
						{$_('af.otp_totp.algorithm')}
						<select bind:value={af.params.algorithm} disabled={!regen} on:input={tafDesync}>
							<option value="SHA1"> SHA-1 </option>
							<option value="SHA256"> SHA-256 </option>
							<option value="SHA512"> SHA-512 </option>
						</select>
					</label>
					<label>
						{$_('af.otp_totp.period')}
						<input
							type="interval"
							bind:value={af.params.period}
							disabled={!regen}
							on:input={tafDesync}
						/>
					</label>
				{:else if af.verifier === 'limited'}
					<label>
						<Icon icon="mdi:timer-outline" />
						{$_('af.limited.times')}
						<input
							type="number"
							bind:value={af.params.times}
							disabled={!regen}
							on:input={tafDesync}
						/>
					</label>
				{:else if af.verifier === 'webauthn'}
					<label>
						{$_('af.webauthn.req_uv')}
						<input
							type="checkbox"
							bind:value={af.params.require_user_verification}
							disabled={!regen}
							on:input={tafDesync}
						/>
					</label>
				{/if}
			</form>
		</div>
		{#if tafSet}
			<div class="taf panel">
				<h5>
					{$_('config.ax.preview')}
				</h5>
				<Box level="info">
					{$_('config.ax.preview_state')}
				</Box>
				<Box level="debug">
					TAFID: <code>{tafid}</code>
				</Box>
				<AFChallenge af={new Af({ ...af, uuid: tafid })} bind:attempt {callback} {result} />
			</div>
			{#if feedback}
				<div class="feedback">
					<h5>
						{$_('config.ax.feedback')}
					</h5>
					{#if af.verifier === 'otp_totp'}
						{$_('af.otp_totp.qr')}
						<canvas bind:this={canvas} />
						<details>
							<summary>{$_('af.otp_totp.details')}</summary>
							{$_('af.otp_totp.secret_key')} <code>{feedback.secret_key}</code><br />
							{$_('af.otp_totp.algorithm')}
							{feedback.algorithm}<br />
							{$_('af.otp_totp.digits')}
							{feedback.digits}<br />
							{$_('af.otp_totp.period')}
							{feedback.period}<br />
						</details>
					{:else if $debugMode}
						Feedback: <code>{JSON.stringify(feedback)}</code>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.af-input > div {
		flex: 50%;
	}
	.af-input:not(:last-child) {
		margin-bottom: 16px;
	}

	.non-top {
		display: flex;
		flex-wrap: wrap;
	}

	.meta {
		margin-right: 16px;
	}

	.top {
		display: flex;
		align-items: flex-start;
	}

	.top h4 {
		flex-grow: 1;
	}

	form {
		display: flex;
		flex-direction: column;
	}
</style>
