<script lang="ts" type="module">
	import UnsavedChanges from '$lib/UnsavedChanges.svelte';
	import type { UserLogin, Client } from '$lib/api2';
	export let ul: UserLogin;
	export let client: Client;
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
</script>

<h2>
	{#if ul.name === null}
		<em>(name unset)</em>
	{:else}
		{ul.name}
	{/if}
	{#if unsavedChanges}
		<UnsavedChanges />
	{/if}
</h2>
<div class="flex">
	<div class="ctrl">
		<input type="button" value="Revoke" on:click={revoke} disabled={ul.current} />
		<input class="delete" type="button" value="Delete" on:click={delete_} />
		<form>
			<label>
				Name
				<input type="text" bind:value={ul.name} on:input={() => unsavedChanges = true} />
			</label>
			<input class="update" type="button" value="Update" on:click={updateName} />
		</form><br/>
	</div>
	<div class="tags">
		{#if ul.current}
			<div class="tag">Current</div>
		{/if}
		{#if ul.end === null}
			<div class="tag">Ongoing</div>
		{:else}
			<div class="tag">Ended</div>
		{/if}
		{#if ul.last === null}
			<div class="tag">hmdge</div>
		{/if}
	</div>
</div>
<div class="flex">
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
		Start: {ul.start}<br/>
		Last Seen: {ul.last}<br/>
		End: {ul.end}<br/>
	</div>
	<div class="headers">
		<h3>Headers</h3>
		<ul>
			{#each Array.from(Object.entries(ul.extra.headers)) as [key, value]}
				<li>
					<code>{key}</code>: <code>{value}</code>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.flex {
		display: flex;
	}

	.etc, .ctrl {
		flex-shrink: 0;
	}

	.tags {
		flex: 100%;
		text-align: right;
	}
</style>
