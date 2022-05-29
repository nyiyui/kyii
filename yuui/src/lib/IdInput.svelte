<script lang="ts" type="module">
	import type { Client, Identity } from "$lib/api";
	import Icon from '@iconify/svelte';
	import Box from '../lib/Box.svelte';
	import BoxError from '../lib/BoxError.svelte';
	import { onMount } from 'svelte';
	import UnsavedChanges from '$lib/UnsavedChanges.svelte';
	import EmailVerified from '$lib/EmailVerified.svelte';

	export let client: Client;

	let initSlug: string;
	let slug: string;
	let slugTaken: boolean|null;
	let name: string;
	let email: string;
	let idUnsavedChanges = false;
	let gUnsavedChanges = false;
	let submitIdError: string;
	let gErrors = new Map<string, string>();

	let id: Identity;

	onMount(async () => {
		id = await client.getId();
		({ slug, name, email } = id);
		initSlug = slug;
		slugFind();
	});
	async function slugFind() {
		idUnsavedChanges = true;
		if (slug == initSlug) {
			slugTaken = null;
			return;
		}
		slugTaken = (await client.username(slug)).exists; // TODO: fix naming inconsistency
	}

	async function submitId() {
		try {
			await client.submitId({ slug, name, email });
			submitIdError = '';
			idUnsavedChanges = false;
			console.log('submitId done');
		} catch (e) {
			console.error(`submitId: ${e}`);
			submitIdError = e.toString();
		}
	}

	async function submitGEmail(gid: string, email: string) {
		try {
			await client.submitGEmail(gid, email);
			gErrors[gid] = '';
			gUnsavedChanges = false;
			console.log('submitGEmail done');
		} catch (e) {
			console.error(`submitGEmail: ${e}`);
			gErrors[gid] = e.toString();
		}
	}
</script>

<div class="flex">
	<div class="panel flex-in">
		<h3>
			Personal
			{#if idUnsavedChanges}
				<UnsavedChanges />
			{/if}
		</h3>
		<form class="identity">
			<label>
				UUID
				<input type="text" value={id ? id.uuid : ""} disabled />
			</label>
			<br />
			<label>
				Slug
				<input id="slug" type="text" autocomplete="username" bind:value={slug} on:input={slugFind} />
				{#if slugTaken === true}
					<Icon icon="mdi:alert" style="color: var(--color-error);" />
					Taken
				{:else if slug === ""}
					<Icon icon="mdi:cancel" style="color: var(--color-error);" />
					Cannot be blank
				{:else if slugTaken === null}
					<Icon icon="mdi:check" style="color: var(--color-info);" />
					Current
				{:else if slugTaken === false}
					<Icon icon="mdi:check" style="color: var(--color-ok);" />
					Available
				{:else}
					Loading
				{/if}
			</label>
			<br/>
			<label>
				<input id="name" type="name" autocomplete="name" bind:value={name} on:input={() => idUnsavedChanges = true} />
				{#if name === ""}
					<Icon icon="mdi:cancel" style="color: var(--color-error);" />
					Cannot be blank
				{:else if name !== ""}
					<Icon icon="mdi:check" style="color: var(--color-ok);" />
				{:else}
					Loading
				{/if}
			</label>
			<br/>
			<input class="update" type="button" on:click={submitId} value="Update" />
			<BoxError msg={submitIdError} />
		</form>
	</div>
	<div class="panel flex-in">
		<h3>Groups</h3>
		{#if id}
			{#each id.groups as group}
				<div class="group">
					{group.name}
					(<code>{group.slug}</code>)
					{#if group.email}
						<a href="mailto:{group.email}">
							{group.email}
						</a>
						{#if group.email_verified}
							<EmailVerified />
						{/if}
						<label>
							Email
							<input id="email" type="email" autocomplete="email" bind:value={group.email} on:input={() => gUnsavedChanges = true} />
						</label>
						{#if group.email === ""}
							<Icon icon="mdi:cancel" style="color: var(--color-error);" />
							Cannot be blank
						{:else if group.email !== ""}
							<Icon icon="mdi:check" style="color: var(--color-ok);" />
							Sure, why not (but idk lol)
						{:else}
							Loading
						{/if}
						<br/>
						<input class="verify" type="button" value="Verify Email" on:cilck={() => submitGEmail(group.id, group.email)} />
						<BoxError msg={gErrors[group.id]} />
					{/if}
					<details>
						<summary>{group.perms.length} perm(s)</summary>
						<ul>
							{#each group.perms as perm}
								<li>
									<code>{perm}</code>
								</li>
							{/each}
					</details>
				</div>
			{/each}
		{/if}
	</div>
	<div class="panel flex-in">
		<h3>Perms</h3>
		{#if id}
			<div class="flex">
				<div class="flex-in">
					<h4>Your</h4>
					<ul>
						{#each id.perms as perm}
							<li>
								<code>{perm}</code>
							</li>
						{/each}
					</ul>
				</div>
				<div class="flex-in">
					<h4>Default</h4>
					<ul>
						{#each id.default_perms as perm}
							<li>
								<code>{perm}</code>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.flex-in {
		flex: 50%;
	}
</style>
