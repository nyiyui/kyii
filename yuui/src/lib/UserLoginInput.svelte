<script lang="ts" type="module">
	import { time } from 'svelte-i18n'
	import UnsavedChanges from '$lib/UnsavedChanges.svelte';
	import { client } from '$lib/api2';
	import type { UserLogin } from '$lib/api2';
	export let ul: UserLogin;
	export let deleteCallback: () => void;
	let unsavedChanges = false;

	async function revoke() {
		await client.revokeUl(ul.uuid);
		console.log(`revoke UL ${ul.uuid}`);
	}

	async function delete_() {
		await client.deleteUl(ul.uuid);
		console.log(`delete UL ${ul.uuid}; callback`);
		deleteCallback();
	}

	async function updateName() {
		await client.editUl(ul.uuid, ul.name);
		console.log(`edit UL ${ul.uuid}`);
		unsavedChanges = false;
	}

	const timeOpts: IntlFormatterOptions<DateTimeFormatOptions> = {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		timeZoneName: 'short',
	};
</script>

<section class="ul panel flex flex-column">
	<div class="meta flex flex-row">
		<h2>
			<span contenteditable="true" bind:textContent={ul.name}></span>
			{#if unsavedChanges}
				<UnsavedChanges />
			{/if}
		</h2>
		<div class="tags">
			{#if ul.current}
				<div class="tag current">Current</div>
			{/if}
			{#if ul.end === null}
				<div class="tag ongoing">Ongoing</div>
			{:else}
				<div class="tag ended">Ended</div>
			{/if}
		</div>
		<div class="ctrl">
			<input class="warn" type="button" value="Revoke" on:click={revoke} disabled={ul.current} />
			<input class="delete" type="button" value="Delete" on:click={delete_} />
			<input class="update" type="button" value="Update" on:click={updateName} />
		</div>
	</div>
	<div class="content">
		<div class="etc">
			<h3>Etc</h3>
			UUID: <code>{ul.uuid}</code><br/>
			Remote: {ul.extra.remote}<br/>
			Against:
			{#if ul.against}
				<a href={`/config#${ul.against.uuid}`}>{ul.against.name}</a>
			{:else}
				<em>Nothing (initial session)</em>
			{/if}
			<br/>
			Start: {$time(ul.start, timeOpts)}<br/>
			{#if ul.last !== null}
			Last Seen: {$time(ul.last, timeOpts)}<br/>
			{/if}
			{#if ul.end !== null}
			End: {$time(ul.end, timeOpts)}<br/>
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

	.tag.current {
		border-color: var(--color-info);
	}

	.tag.ended {
		border-color: var(--color-ok);
	}
</style>
