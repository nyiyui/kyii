<script lang="ts" type="module">
	import { debugMode } from '$lib/store';
	import { newUrl } from '$lib/otp';
	import Icon from '@iconify/svelte';
	import AF from '$lib/AF.svelte';
	import type { Af } from '$lib/api';
	import { AttemptResultStatus } from '$lib/util';

	export let af: Af;
	export let attempt: string;
	export let callback;
	export let result;
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
				<input type="button" value="Submit" on:click={() => callback(af.uuid, attempt)} />
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
					<Icon icon="mdi:check-circle" style="color: var(--color--ok);" />
				{:else if result.status === AttemptResultStatus.Fail}
					<Icon icon="mdi:close-circle" style="color: var(--color-error);" />
					{result.msg}
				{:else if result.status === AttemptResultStatus.Error}
					<Icon icon="mdi:alert-circle" style="color: var(--color-warn);" />
					{#if $debugMode}
						{result.msg}
					{/if}
				{:else}
					<Icon icon="mdi:alert-octagon" style="color: var(--color-error);" />
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
