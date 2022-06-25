<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import { time } from 'svelte-i18n'
	import UnsavedChanges from '$lib/UnsavedChanges.svelte'
	import { client } from '$lib/api2'
	import type { UserLogin } from '$lib/api2'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	// TODO: rename current to you

	export let ul: UserLogin
	let unsavedChanges = false
	let newName: string | null = ul.name || null
	let nameSpan: HTMLSpanElement

	$: unsavedChanges = (ul.name || '') !== (newName || '')

	async function revoke() {
		await client.revokeUl(ul.uuid)
		console.log(`revoke UL ${ul.uuid}`)
		ul.end = new Date()
		ul.reason = 'revoke'
		console.log(ul)
		dispatch('revoke')
	}

	async function delete_() {
		await client.deleteUl(ul.uuid)
		console.log(`delete UL ${ul.uuid}; callback`)
		dispatch('delete')
	}

	async function updateName() {
		await client.editUl(ul.uuid, newName)
		console.log(`edit UL ${ul.uuid}`)
		ul.name = newName
	}

	const timeOpts = {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		timeZoneName: 'short'
	}
</script>

<section class="ul panel flex flex-column">
	<div class="meta flex flex-row">
		<h2>
			<span contenteditable="true" bind:textContent={newName} bind:this={nameSpan} />
			{#if !newName}
				<em on:click={nameSpan.focus()}>
					{$_('untitled')}
				</em>
			{/if}
			{#if unsavedChanges}
				<UnsavedChanges />
			{/if}
		</h2>
		<div class="tags">
			{#if ul.current}
				<span class="tag you">{$_('ul.tag.you')}</span>
			{/if}
			{#if ul.end === null}
				<span class="tag ongoing">{$_('ul.tag.ongoing')}</span>
			{:else if ul.reason === 'revoke'}
				<span class="tag revoked">{$_('ul.tag.revoked')}</span>
			{:else if ul.reason === 'logout'}
				<span class="tag logged_out">{$_('ul.tag.logged_out')}</span>
			{:else}
				<span class="tag ended">{$_('ul.tag.ended')}</span>
			{/if}
		</div>
		<div>
			{#if ul.end === null}
				<input class="warn" type="button" value="Revoke" on:click={revoke} disabled={ul.current} />
			{/if}
			<input class="delete" type="button" value="Delete" on:click={delete_} />
			<input class="update" type="button" value="Update" on:click={updateName} />
		</div>
	</div>
	<div class="content">
		<div class="etc">
			<h3>Etc</h3>
			UUID:<code>{ul.uuid}</code><br />
			Remote: {ul.extra.remote}<br />
			Against:
			{#if ul.against}
				<a href={`/config#${ul.against.uuid}`}>{ul.against.name}</a>
			{:else}
				<em>Nothing (initial session)</em>
			{/if}
			<br />
			Start: {$time(ul.start * 1000, timeOpts)}<br />
			{#if ul.last !== null}
				Last Seen: {$time(ul.last * 1000, timeOpts)}<br />
			{/if}
			{#if ul.end !== null}
				End: {$time(ul.end * 1000, timeOpts)}<br />
			{/if}
			{#if ul.reason}
				Reason of revocation: {$_(`ul.reason.${ul.reason}`, { default: ul.reason })}
			{/if}
		</div>
		<div class="headers">
			<h3>Headers</h3>
			<ul class="headers-ul">
				{#each Array.from(Object.entries(ul.extra.headers)) as [key, value]}
					<li>
						<code>{key}</code>: <code>{value}</code>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.content {
		display: flex;
	}

	.content > * {
		flex-direction: column;
		padding: 8px;
	}

	.headers {
		flex-shrink: 2;
	}

	.headers-ul {
		list-style-type: none;
		padding-left: 0;
	}

	.meta > h2 {
		flex-grow: 1;
	}

	.tag.ongoing {
		border-color: var(--color-warn);
	}

	.tag.you {
		border-color: var(--color-info);
	}

	.tag.revoked {
		border-color: var(--color-warn);
	}

	.tag.logged_out {
		border-color: var(--color-ok);
	}

	.tag.ended {
		border-color: var(--color-ok);
	}
</style>
