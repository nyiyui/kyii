<script lang="ts" type="module">
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
			console.log(`feedback2`, feedback)
			const credential = (await navigator.credentials.create({
				publicKey: feedback
			})) as PublicKeyCredential
			console.log('webauthn credential', credential)
			const credentialJSON = JSON.stringify({
				id: credential.id,
				rawId: encodeBase64(credential.rawId),
				response: {
					clientDataJSON: encodeBase64(credential.response.clientDataJSON),
					attestationObject: encodeBase64(
						(credential.response as AuthenticatorAttestationResponse).attestationObject
					)
				},
				type: credential.type
			})
			console.log('webauthn credential json', credentialJSON)
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

	async function callback(_: string, attempt: string): any {
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
				console.log('webauthn ao', ao)
				const assertion = (await navigator.credentials.get({
					publicKey: ao
				})) as PublicKeyCredential
				console.log('webauthn assertion', assertion)
				;({
					success,
					done,
					msg,
					feedback: verifyFeedback
				} = await client.verifyTaf(
					tafid,
					JSON.stringify({ state: '2_verify', credential: JSON.stringify(assertion) }),
					true
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
		console.log(canvas)
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
		<input class="delete" type="button" on:click={() => dispatch('delete')} value="Delete" />
	</div>
	<div class="non-top">
		<div class="meta">
			<h5>Meta</h5>
			<label>
				Verifier
				<!-- (below)TODO: make this like a dropdown or sth -->
				<input type="text" bind:value={verifier} />
			</label>
			<AF verifier={af.verifier} />
			<Box level="debug">
				N: {n};
				AFID: {af.uuid};
				TAFID: {tafid}
			</Box>
		</div>
		<div class="params">
			<h5>
				Params
				{#if !tafSynched}
					<UnsavedChanges />
				{/if}
			</h5>
			{#if regen}
				<input class="delete" type="button" value="Delete Temporary AF" on:click={delRegen} />
				<input type="button" value="Generate Temporary AF" on:click={setRegen} />
			{:else}
				<input class="new" type="button" value="Regenerate AF (allocate TAF)" on:click={newRegen} />
			{/if}
			<form>
				{#if af.verifier === 'pw'}
					<label>
						<Icon icon="mdi:dialpad" />
						Password
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
						Digits
						<input
							type="number"
							bind:value={af.params.digits}
							disabled={!regen}
							on:input={tafDesync}
						/>
					</label>
					<br />
					<label>
						Period/Interval
						<input
							type="interval"
							bind:value={af.params.period}
							disabled={!regen}
							on:input={tafDesync}
						/>
					</label>
					<br />
					<label>
						Algorithm
						<select bind:value={af.params.algorithm} disabled on:input={tafDesync}>
							<option value="SHA1">SHA1</option>
						</select>
					</label>
				{:else if af.verifier === 'limited'}
					<label>
						<Icon icon="mdi:timer-outline" />
						Times
						<input
							type="number"
							bind:value={af.params.times}
							disabled={!regen}
							on:input={tafDesync}
						/>
					</label>
				{:else if af.verifier === 'webauthn'}
					<label>
						Require User Verification
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
				<h5>Preview (temporary AF)</h5>
				<Box level="info">State is temporary.</Box>
				<Box level="debug">
					TAFID: <code>{tafid}</code>
				</Box>
				<AFChallenge af={new Af({ ...af, uuid: tafid })} bind:attempt {callback} {result} />
			</div>
			{#if feedback}
				<div class="feedback">
					<h5>Feedback</h5>
					{#if af.verifier === 'otp_totp'}
						{#if feedback === null}
							<Box level="info"
								>No feedback due to having no modifications (therefore no regenerations)</Box
							>
						{:else}
							<details>
								<summary>QR Code</summary>
								<canvas bind:this={canvas} />
							</details>
							<details>
								<summary>Raw Config</summary>
								Secret Key: <code>{feedback.secret_key}</code>
								Algorithm: {feedback.algorithm}
								Digits: {feedback.digits}
								Period/interval: {feedback.period}
							</details>
						{/if}
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
</style>
