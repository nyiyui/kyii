<script lang="ts" type="module">
	import { debugMode, apiBaseUrl } from '$lib/store';
	import qrCode from 'qrcode';
	import { newUrl } from '$lib/otp';
	import Icon from '@iconify/svelte';
	import AF from '$lib/AF.svelte';
	import AFChallenge from '$lib/AFChallenge.svelte';
	import type { Client, AfInput } from '$lib/api';
	import { Af } from '$lib/api';
	import { AttemptResultStatus } from '$lib/util';
	import Box from '$lib/Box.svelte';
	import UnsavedChanges from '$lib/UnsavedChanges.svelte';
	import VerifiedChanges from '$lib/VerifiedChanges.svelte';

	export let n: number;
	export let af: AfInput;
	let feedback: any;
	let verifier: string = af.verifier;
	export let regen = false;
	export let tafid: string | null;
	export let client: Client;
	let attempt: string;

	let result: {
		status: AttemptResultStatus,
		msg?: string,
	};

	let tafSet = false;
	let tafSynched = true;
	let tafVerified = false;

	async function setTaf() {
		if (!tafid) {
			tafid = await client.allocTaf();
			console.log(`alloc taf ${tafid}`);
		} else {
			console.log(`already alloc taf ${tafid}`);
		}
		({ feedback } = await client.setTaf(tafid, af));
		console.log('feedback');
		console.log(feedback);
		tafSet = true;
		tafSynched = true;
	}

	async function deallocTaf() {
		if (!tafid)
			return;
		console.log(`dealloc taf ${tafid}`);
		await client.deallocTaf(tafid);
		tafid = null;
	}

	async function setRegen() {
		await setTaf();
		if (af.verifier === 'otp_totp')
			loadQr();
	}

	async function newRegen() {
		regen = true;
		af.params = {};
	}

	async function delRegen() {
		regen = false;
		await deallocTaf();
		tafSet = false;
		tafSynched = true;
	}

	function tafDesync() {
		tafSynched = false;
	}

	async function callback(_: string, attempt: string) {
		try {
			let success: boolean;
			let msg: string;
			({ success, msg } = await client.attemptTaf(tafid, attempt));
			result = {
				status: success ? AttemptResultStatus.Success : AttemptResultStatus.Fail,
				msg,
			};
			tafVerified = success;
		} catch (e) {
			result.status = AttemptResultStatus.Error;
			result.msg = e.toString();
		}
	}

	function updateVerifier() {
		if (verifier === "pw") {
			af.params = {password: ""};
		} else if (verifier === "otp_totp") {
			af.params = {digits: 6, period: 30, algorithm: "SHA1"};
		} else if (verifier === "ctrl_email") {
			af.params = {email: ""};
		} else if (verifier === "ctrl_tel") {
			af.params = {tel: ""};
		} else {
			//throw new Error(`unknown verifier ${verifier}`);
		}
		af.verifier = verifier;
	}

	$: {
		verifier;
		try {
			updateVerifier();
		} catch (e) {
			console.log(e);
		}
	}

//	$: {
//		if (canvas && feedback !== undefined && af.verifier === "otp_totp") {
//			loadQr();
//		}
//	}

	let canvas: HTMLCanvasElement;

	async function loadQr() {
		const s = await client.status();
		const url = newUrl({
						issuer: `Kyii Airy ${$apiBaseUrl}`,
						user: `${s.user.username}`,
						key: feedback.secret_key,
						algorithm: feedback.algorithm,
						digits: feedback.digits,
						period: feedback.period,
					});
		console.log(canvas);
		qrCode.toCanvas(canvas, url.toString(), (error) => {
			if (error) console.error(error);
		});
	}
</script>

<div class="af-input" id={af.uuid}>
	<div class="left">
		<div class="meta">
			<h3>
				{af.name}
				{#if regen}
					<UnsavedChanges />
					<VerifiedChanges verified={tafVerified} />
				{/if}
			</h3>
			<h4>Meta</h4>
			<label>
				Name
				<input type="text" bind:value={af.name} />
			</label>
			<br/>
			<label>
				Verifier
				<!-- (below)TODO: make this like a dropdown or sth -->
				<input type="text" bind:value={verifier} />
			</label>
		</div>
		<div class="verifier">
			<AF verifier={af.verifier} />
		</div>
		{#if $debugMode}
		<div class="debug">
			<h4>Debug</h4>
			<br/>
			N: {n}
			<br/>
			UUID: <code>{af.uuid}</code>
		</div>
		{/if}
	</div>
	<div class="right">
		<div class="params">
			<h4>
				Params
				{#if !tafSynched}
					<UnsavedChanges />
				{/if}
			</h4>
			{#if regen}
				<input class="delete" type="button" value="Delete Temporary AF" on:click={delRegen} />
				<input type="button" value="Generate Temporary AF" on:click={setRegen} />
			{:else}
				<input class="new" type="button" value="Regenerate AF (create temporary AF)" on:click={newRegen} />
			{/if}
			<form>
				{#if af.verifier === "pw"}
					<label>
						<Icon icon="mdi:dialpad" />
						Password
						<input type="password" bind:value={af.params.password} autocomplete="new-password" disabled={!regen} on:input={tafDesync} />
					</label>
				{:else if af.verifier === "otp_totp"}
					<label>
						Digits
						<input type="number" bind:value={af.params.digits} disabled={!regen} on:input={tafDesync} />
					</label>
					<br/>
					<label>
						Period/Interval
						<input type="interval" bind:value={af.params.period} disabled={!regen} on:input={tafDesync} />
					</label>
					<br/>
					<label>
						Algorithm
						<select bind:value={af.params.algorithm} disabled on:input={tafDesync} >
							<option value="SHA1">SHA1</option>
						</select>
					</label>
				{:else if af.verifier === "ctrl_email"}
					<label>
						<Icon icon="mdi:at" />
						Email Address
						<input type="email" bind:value={af.params.email} disabled={!regen} on:input={tafDesync} />
					</label>
				{/if}
			</form>
		</div>
		{#if tafSet}
			<div class="taf">
				<fieldset>
					<legend>Preview</legend>
					<AFChallenge af={new Af({ ...af, uuid: tafid })} bind:attempt={attempt} callback={callback} result={result} />
					{#if $debugMode}
						TAFID: <code>{tafid}</code>
					{/if}
				</fieldset>
			</div>
		{/if}
		{#if feedback !== undefined}
			<div class="feedback">
				<h4>Feedback</h4>
				{#if af.verifier === "otp_totp"}
					{#if feedback === null}
						<Box level="info">No feedback due to having no modifications (therefore no regenerations)</Box>
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
				{:else}
					{#if $debugMode}
						Feedback: <code>{JSON.stringify(feedback)}</code>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.af-input {
		display: flex;
	}
	@media screen and ( max-width: 1200px ) {    
	  .af-input {    
	    flex-direction: column;    
	  }    
	}
	.af-input > div {
		flex: 50%;
	}
	.verifier {
		font-size: 14px;
	}
	.params {
		text-align: right;
	}
	.af-input:not(:last-child) {
		margin-bottom: 16px;
	}
</style>
