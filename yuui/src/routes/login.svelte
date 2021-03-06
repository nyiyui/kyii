<script lang="ts" type="module">
	// TODO: call loginStop
	import { _ } from 'svelte-i18n'
	import { page } from '$app/stores'
	import { allowMULPU } from '$lib/store'
	import { getNext } from '$lib/util'
	import { Ap, client, ulos } from '$lib/api2'
	import type { AfPublic } from '$lib/api2'
	import Icon from '@iconify/svelte'
	import Box from '$lib/Box.svelte'
	import AFChallenge from '$lib/ax/AFChallenge.svelte'
	import APSelect from '$lib/ax/APSelect.svelte'
	import { AttemptResultStatus } from '$lib/util'
	import { browser } from '$app/env'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'

	let slug: string
	let slugFound: boolean | 'mulpu' | undefined = undefined
	let uid: string
	let autosel: boolean
	let chosen = false
	let apUuid: string
	let attempts: Map<string, string> = new Map()

	let next

	if (browser) {
		next = getNext($page.url.searchParams)
	}

	let done: boolean
	let aps: Array<Ap> = []
	let afs: Array<AfPublic> = []

	let attemptResults: Map<string, { status: AttemptResultStatus; msg: string }> = new Map()
	// string: error
	// not set: not attempted
	// true: ok

	function isMULPUBySlug(slug: string): boolean {
		for (const ulo of $ulos) {
			if (ulo[1].slug === slug) {
				return true
			}
		}
		return false
	}

	async function usernameSync() {
		const url = new URL(window.location.toString())
		url.searchParams.set('slug', encodeURIComponent(slug))
		window.history.replaceState({}, '', url)

		// NOTE: DNC about slugs changing (too much effort (for now))
		if (!$allowMULPU && isMULPUBySlug(slug)) {
			slugFound = 'mulpu'
		} else {
			slugFound = null
		}
	}

	async function usernameFind() {
		const resp = await client.loginStart(slug)
		if (!resp) {
			slugFound = false
			return
		}
		slugFound = true
		;({ uid, aps } = resp)
		autosel = aps.length == 1
		if (autosel) {
			const ap = aps[0]
			console.log(`${ap.uuid}を自動選択`)
			apUuid = ap.uuid
			choose()
		}
	}

	onMount(async () => {
		const urlSlug = new URLSearchParams(window.location.search).get('slug')
		if (urlSlug) {
			console.log('using slug specified by query params', urlSlug)
			slug = urlSlug
			await usernameFind()
		}
	})

	$: {
		apUuid
		if (apUuid) choose()
	}

	async function choose() {
		console.log(`choosing ${apUuid}`)
		const resp = await client.loginChoose(apUuid)
		if (resp === undefined) {
			alert('Login failed')
			return
		}
		;({ afs } = resp)
		chosen = true
	}

	async function attempt(afUuid: string, chalResp: string) {
		try {
			const resp = await client.loginAttempt(afUuid, chalResp)
			let common = { feedback: resp.feedback }
			if (resp.cur_done) {
				done = resp.all_done
				attemptResults.set(afUuid, { status: AttemptResultStatus.Success, msg: '', ...common })
				if (done) {
					if (next) goto(next)
					else goto('/login')
				}
			} else {
				attemptResults.set(afUuid, { status: AttemptResultStatus.Fail, msg: resp.msg, ...common })
			}
			return resp.feedback
		} catch (e) {
			attemptResults.set(afUuid, { status: AttemptResultStatus.Error, msg: e.toString() })
		}
		attemptResults = attemptResults
	}
</script>

<svelte:head>
	<title>{$_('header.login')}</title>
</svelte:head>

<main class="login-start">
	<form id="login">
		<div id="login-top">
			<div id="login-u">
				<label>
					{$_('login.username')}
					<input
						id="username"
						type="username"
						autocomplete="username"
						bind:value={slug}
						on:input={usernameSync}
					/>
				</label>
				<input type="button" value={$_('login.next')} on:click={usernameFind} />
				{#if slugFound === true}
					<Icon icon="mdi:account-check" style="color: var(--color-ok);" />
				{:else if slugFound === 'mulpu'}
					<Icon icon="mdi:account-cancel" style="color: var(--color-warn);" />
					{$_('login.user_mulpu')}
				{:else if slugFound === false}
					<Icon icon="mdi:account-cancel" style="color: var(--color-error);" />
					{$_('login.user_not_found')}
				{/if}
			</div>
		</div>
		{#if slugFound === true}
			<div class="flex">
				{#if !autosel}
					<div class="padded flex-in">
						<h2>{$_('login.aps')}</h2>
						<Box level="debug"><pre>{JSON.stringify(aps, null, 2)}</pre></Box>
						<Box level="debug">APID: <code>{apUuid}</code></Box>
						<APSelect {aps} bind:chosen={apUuid} on:select={choose} />
					</div>
				{/if}
				{#if chosen}
					<div class="padded flex-in afs">
						<h2>{$_('login.afs')}</h2>
						<Box level="debug"><pre>{JSON.stringify(afs, null, 2)}</pre></Box>
						{#if afs}
							{#each afs as af}
								<AFChallenge
									{uid}
									bind:af
									bind:attempt={attempts[af.uuid]}
									callback={attempt}
									result={attemptResults.get(af.uuid)}
								/>
							{/each}
						{/if}
					</div>
				{/if}
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
		flex-wrap: wrap;
	}
	.afs {
		flex-grow: 1;
	}
	#login-status {
		text-align: right;
	}
</style>
