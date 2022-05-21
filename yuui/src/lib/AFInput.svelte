<script lang="ts" type="module">
	import { debugMode } from '$lib/store';
	import qrCode from 'qrcode';
	import { newUrl } from '$lib/otp';
	import Icon from '@iconify/svelte';
	import AF from '$lib/AF.svelte';
	import type { AfInput } from '$lib/api';
	import Box from '$lib/Box.svelte';

	export let n: number;
	export let af: AfInput;
	export let feedback: any;
	let verifier: string = af.verifier;
	export let modified = false;

	function updateVerifier() {
		if (verifier === "pw") {
			af.params = {password: ""};
		} else if (verifier === "otp_totp") {
			af.params = {};
		} else if (verifier === "ctrl_email") {
			af.params = {email: ""};
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

	$: {
		if (canvas !== undefined && feedback !== undefined && af.verifier === "otp_totp") {
			loadQr();
		}
	}

	let canvas: HTMLCanvasElement;

	async function loadQr() {
		const url = newUrl({
						issuer: 'issuer',
						user: "user",
						key: feedback.secret_key,
						algorithm: feedback.algorithm,
						digits: feedback.digits,
						period: feedback.period,
					});
		qrCode.toCanvas(canvas, url.toString(), (error) => {
			if (error) console.error(error);
		});
	}
</script>

<div class="af-input" id={af.uuid}>
	<div class="left">
		<div class="name">
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
			<br/>
			N: {n}
			<br/>
			UUID: <code>{af.uuid}</code>
		</div>
		{/if}
	</div>
	<div class="right">
		<div class="params">
			{#if modified}
				<em>Modified</em>
			{/if}
			{#if af.verifier === "pw"}
				<label>
					<Icon icon="mdi:dialpad" />
					Password
					<input type="password" bind:value={af.params.password} on:input={() => {modified = true}} />
				</label>
			{:else if af.verifier === "otp_totp"}
				<label>
					Regenerate
					<input type="checkbox" bind:checked={modified} />
				</label>
			{:else if af.verifier === "ctrl_email"}
				<label>
					<Icon icon="mdi:at" />
					Email Address
					<input type="email" bind:value={af.params.email} on:input={() => {modified = true}} />
				</label>
			{/if}
		</div>
		{#if feedback !== undefined}
			<div class="feedback">
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
