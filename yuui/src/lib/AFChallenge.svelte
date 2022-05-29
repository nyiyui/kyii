<script lang="ts" type="module">
	import { debugMode } from '$lib/store';
	import Icon from '@iconify/svelte';
	import AF from '$lib/AF.svelte';
	import type { Af } from '$lib/api';
	import { AttemptResultStatus } from '$lib/util';

	export let af: Af;
	export let attempt: string;
	export let callback: (afid: string, attempt: string) => void;
	export let result: { status: AttemptResultStatus, msg: string };
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
			{#if af.verifier === "pw"}
				<label id={af.uuid} class="af">
					Password
					<input type="password" bind:value={attempt} autocomplete="current-password" />
				</label>
				<input type="button" value="Submit" disabled={!attempt} on:click={() => callback(af.uuid, attempt)} />
			{:else if af.verifier === "otp_totp"}
				<label id={af.uuid} class="af">
					Challenge
					<input type="password" bind:value={attempt} autocomplete="one-time-code" />
				</label>
				<input type="button" value="Submit" on:click={() => callback(af.uuid, attempt)} />
			{:else if af.verifier === "ctrl_email"}
				<strong>TODO</strong>
			{/if}
		</div>
		<div class="result">
			{#if result === undefined}
				<Icon icon="mdi:checkbox-blank-circle-outline" style="color: var(--color-neutral);" />
			{:else}
				{#if result.status === AttemptResultStatus.Success}
					<Icon class="ok" icon="mdi:check-circle" />
				{:else if result.status === AttemptResultStatus.Fail}
					<Icon class="error" icon="mdi:close-circle" />
					{result.msg}
				{:else if result.status === AttemptResultStatus.Error}
					<Icon class="error" icon="mdi:alert-circle" />
					{#if $debugMode}
						{result.msg}
					{/if}
				{:else}
					<Icon class="error" icon="mdi:alert-octagon" />
					{result.msg}
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
	.af-challenge {
		display: flex;
	}
	@media screen and ( max-width: 600px ) {    
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
