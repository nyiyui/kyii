<script lang="ts" type="module">
	// TODO: call loginStop
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { getNext } from '$lib/util';
	import { Ap, Af, client } from "$lib/api2";
	import Icon from '@iconify/svelte';
	import AFChallenge from '$lib/ax/AFChallenge.svelte';
	import { AttemptResultStatus } from '$lib/util';
	import { browser } from "$app/env";

	let username: string;
	let usernameFound: boolean|undefined = undefined;
	let apUuid: string;
	let attempts: Map<string, string> = new Map();

	let next;

	if (browser) {
		next = getNext($page.url.searchParams);
	}

	let done: boolean;
	let aps: Array<Ap> = [];
	let afs: Array<Af> = [];

	let attemptResults: Map<string, { status: AttemptResultStatus, msg: string }> = new Map();
	// string: error
	// not set: not attempted
	// true: ok

	async function usernameFind() {
		const resp = await client.loginStart(username);
		if (!resp) {
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
			let common = { feedback: resp.feedback };
			if (resp.cur_done) {
				done = resp.all_done;
				attemptResults.set(afUuid, {status: AttemptResultStatus.Success, msg: "", ...common});
			} else {
				attemptResults.set(afUuid, {status: AttemptResultStatus.Fail, msg: resp.msg, ...common});
			}
		} catch (e) {
			attemptResults.set(afUuid, {status: AttemptResultStatus.Error, msg: e.toString()});
		}
		attemptResults = attemptResults;
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<main class="login-start">
	<form id="login">
		<div id="login-top">
			<div id="login-u">
				<label for="username">{$_('login.username')}</label>
				<input id="username" type="username" autocomplete="username" bind:value={username} on:input={usernameFind} />
				{#if usernameFound === false}
					<Icon icon="mdi:account-cancel" style="color: #fcc;" />
					{$_('login.user_not_found')}
				{:else}
					<Icon icon="mdi:account-check" style="color: #cfc;" />
				{/if}
			</div>
		</div>
		{#if usernameFound}
			<div class="flex">
				<div class="panel flex-in">
					<h2>{$_('login.aps')}</h2>
					{#each aps as ap}
						<label>
							<input type="radio" id="{ap.uuid}" bind:group={apUuid} name="ap" value="{ap.uuid}" on:change={choose} />
							{ap.name}
						</label>
						<br />
					{/each}
				</div>
				<div class="panel flex-in">
					<h2>{$_('login.afs')}</h2>
					{#each afs as af}
						<AFChallenge bind:af bind:attempt={attempts[af.uuid]} callback={attempt} result={attemptResults.get(af.uuid)} />
					{/each}
				</div>
			</div>
		{/if}
		<div id="login-bottom">
			<div id="login-status">
				{#if done === true}
					<Icon icon="mdi:check-circle" style="color: #cfc;" />
					{$_('login.logged_in')}
					<br />
					{#if next}
						<a href={next.toString()}>{$_('login.next')}</a>
					{/if}
				{:else}
					<Icon icon="mdi:checkbox-blank-circle-outline" style="color: #ccc;" />
					{$_('login.pending')}
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
	#login-status {
		text-align: right;
	}
</style>
