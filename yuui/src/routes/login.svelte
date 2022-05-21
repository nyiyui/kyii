<script lang="ts" type="module">
	// TODO: call loginStop
	import { page } from '$app/stores';
	import { Ap, Af, Client } from "../lib/api";
	import type { Status } from "../lib/api";
	import { browser } from "$app/env";
	import Icon from '@iconify/svelte';
	import AF from '../lib/AF.svelte';
	import AFChallenge from '../lib/AFChallenge.svelte';
	import { AttemptResultStatus } from '$lib/util';

	let username: string;
	let usernameFound: boolean|undefined = undefined;
	let apUuid: string;
	let currentAttempt: string;
	let attempts: Map<string, string> = new Map();

	let client: Client;

	function getNext(): string | null {
		// eh, even if argsRaw is malicious it shouldn't do much?
		const nextRel = $page.url.searchParams.get('next');
		if (nextRel !== null) {
			const argsRaw = $page.url.searchParams.get('args') || '';
			return (nextRel !== null) ? new URL(nextRel, import.meta.env.VITE_API_BASE_URL).toString() + '?' + argsRaw : null;
		}
		const selfnextRel = $page.url.searchParams.get('selfnext');
		if (selfnextRel !== null) {
			const argsRaw = $page.url.searchParams.get('selfargs') || '';
			console.log(selfnextRel);
			return (selfnextRel !== null) ? selfnextRel + '?' + argsRaw : null;
		}
		return null;
	}

	const next = getNext();

	let done: boolean;
	let aps: Array<Ap> = [];
	let afs: Array<Af> = [];
	let status: Status;

	let attemptResults: Map<string, { status: AttemptResultStatus, msg: string }> = new Map();
	// string: error
	// not set: not attempted
	// true: ok

	(async () => {
		if (browser) {
			client = new Client();
			// not using export function get in *.ts because it didn't work for moi…maybe a TODO: fix this?
			const s = await client.status();
			if (s !== null) {
				console.log('already logged in; redirecting to next');
				window.location.replace(next || "/");
			}
			console.log('not logged in');
		}
	})();

	async function usernameFind() {
		const resp = await client.loginStart(username);
		if (resp === undefined) {
			usernameFound = false;
			return;
		}
		usernameFound = true;
		({ aps } = resp);
		console.log(username, aps);
	};

	async function choose() {
		 const resp = await client.loginChoose(apUuid);
		 if (resp === undefined) {
		 	alert("Login failed");
			 return;
		 }
		 ({ afs } = resp);
		 console.log(resp);
	}

	async function attempt(afUuid: string, chalResp: string) {
		try {
			const resp = await client.loginAttempt(afUuid, chalResp);
			if (resp.success) {
				({ done } = resp);
				if (done) {
					status = await client.status();
				}
				attemptResults.set(afUuid, {status: AttemptResultStatus.Success, msg: ""});
			} else {
				attemptResults.set(afUuid, {status: AttemptResultStatus.Fail, msg: resp.msg});
			}
		} catch (e) {
			attemptResults.set(afUuid, {status: AttemptResultStatus.Error, msg: e.toString()});
		}
		attemptResults = attemptResults;
	}

	async function check() {
		if (await client.status() !== undefined) {
			console.log('logged in');
		}
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<main class="login-start" on:load={check}>
	<form id="login">
		<div id="login-top">
			<div id="login-u">
				<label for="username">Username</label>
				<input id="username" type="username" autocomplete="username" bind:value={username} on:input={usernameFind} />
				{#if usernameFound === false}
					<Icon icon="mdi:account-cancel" style="color: #fcc;" />
					User not found
				{:else}
					<Icon icon="mdi:account-check" style="color: #cfc;" />
				{/if}
			</div>
		</div>
		{#if usernameFound}
			<div class="flex">
				<div class="panel flex-in">
					<h2>APs</h2>
					{#each aps as ap}
						<label>
							<input type="radio" id="{ap.uuid}" bind:group={apUuid} name="ap" value="{ap.uuid}" on:change={choose} />
							{ap.name}
						</label>
						<br />
					{/each}
				</div>
				<div class="panel flex-in">
					<h2>AFs</h2>
					{#each afs as af}
						<AFChallenge bind:af bind:attempt={attempts[af.uuid]} callback={attempt} result={attemptResults.get(af.uuid)} />
					{/each}
				</div>
			</div>
		{/if}
		<div id="login-bottom">
			<div id="login-status">
				{#if done === true}
					Logged In
					<Icon icon="mdi:check-circle" style="color: #cfc;" />
					<br />
					{#if next !== null}
						<a href={next.toString()}>Next</a>
					{/if}
				{:else}
					Pending
					<Icon icon="mdi:checkbox-blank-circle-outline" style="color: #ccc;" />
				{/if}
			</div>
		</div>
	</form>
</main>

<style>
	.flex {
		display: flex;
	}
	.flex-in {
		flex: 50%;
	}
	#login-as {
		display: flex;
	}
	.ax-input:not(:last-child) {
		margin-bottom: 16px;
	}
	#login-status {
		text-align: right;
	}
</style>
