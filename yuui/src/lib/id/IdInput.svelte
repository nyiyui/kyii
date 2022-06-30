<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Dropzone from 'svelte-file-dropzone'
	import { client, ulos, currentUlid } from '$lib/api2'
	import type { Id } from '$lib/api2'
	import Icon from '@iconify/svelte'
	import BoxError from '$lib/BoxError.svelte'
	import { debugMode } from '$lib/store'
	import { onMount } from 'svelte'
	import UnsavedChanges from '$lib/UnsavedChanges.svelte'
	//import EmailVerified from '$lib/EmailVerified.svelte';

	let candFile: File | null = null
	let candFileObjectUrl: string | null = null

	function handleFilesSelect(e) {
		const { acceptedFiles } = e.detail
		if (acceptedFiles.length) {
			candFile = acceptedFiles[0]
			if (candFileObjectUrl) {
				URL.revokeObjectURL(candFileObjectUrl)
			}
			candFileObjectUrl = URL.createObjectURL(candFile)
		}
		idUnsavedChanges = true
	}

	let initSlug: string
	let slug: string
	let slugTaken: boolean | null
	let name: string
	export let idUnsavedChanges = false
	//let gUnsavedChanges = false;
	let submitIdError: string
	let submitIdLoading = false
	//let gErrors = new Map<string, string>();

	let id: Id

	onMount(async () => {
		try {
			id = await client.getId()
			;({ slug, name } = id)
			initSlug = slug
			slugFind()
		} catch (err) {
			submitIdError = `アイデンティティの取得: ${err.toString()}`
		}
	})
	async function slugFind() {
		idUnsavedChanges = true
		if (slug == initSlug) {
			slugTaken = null
			return
		}
		slugTaken = await client.userExists(slug) // TODO: fix naming inconsistency
	}

	async function submitId() {
		submitIdLoading = true
		try {
			await Promise.all([
				client.submitId({ slug, name }),
				(async () => {
					if (candFile) {
						await client.submitImg(candFile)
					}
				})()
			])
			submitIdError = ''
			idUnsavedChanges = false
			console.log('submitId done')
			// NOTE: update ulos with data
			console.log('currentUlid', $currentUlid)
			const ulid = $currentUlid
			if ($ulos.get(ulid)) {
				$ulos.set(ulid, {
					...$ulos.get(ulid),
					slug,
					name
				})
				$ulos = $ulos
			}
		} catch (e) {
			console.error(`submitId: ${e}`)
			submitIdError = e.toString()
		}
		submitIdLoading = false
	}

	//async function submitGEmail(gid: string, email: string) {
	//	try {
	//		await client.submitGEmail(gid, email);
	//		gErrors[gid] = '';
	//		gUnsavedChanges = false;
	//		console.log('submitGEmail done');
	//	} catch (e) {
	//		console.error(`submitGEmail: ${e}`);
	//		gErrors[gid] = e.toString();
	//	}
	//}
</script>

<div class="flex">
	<div class="flex-in">
		<h2>
			Personal
			{#if idUnsavedChanges}
				<UnsavedChanges />
			{/if}
		</h2>
		<form class="identity">
			<div class="img">
				<div class="dropzone">
					<Dropzone on:drop={handleFilesSelect} multiple={false} accept="image/*">
						{$_('config.id.img.dropzone')}
					</Dropzone>
				</div>
				{#if candFileObjectUrl}
					<div class="preview">
						{$_('config.id.img.preview.title')}<br />
						<img alt={$_('iori.user.profile')} class="user-img" src={candFileObjectUrl} />
					</div>
				{/if}
			</div>
			<label>
				<span class="label">User ID</span>
				<input type="text" value={id ? id.uid : ''} disabled />
			</label>
			<br />
			<label>
				<span class="label">Slug</span>
				<input
					id="slug"
					type="text"
					autocomplete="username"
					bind:value={slug}
					on:input={slugFind}
				/>
			</label>
			<span class="status" role="status">
				{#if slugTaken === true}
					<Icon icon="mdi:alert" style="color: var(--color-error);" />
					Taken
				{:else if slug === '' || slug === null}
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
			</span>
			<br />
			<label>
				<span class="label">Name</span>
				<input
					id="name"
					type="name"
					autocomplete="name"
					bind:value={name}
					on:input={() => (idUnsavedChanges = true)}
				/>
			</label>
			<span class="status" role="status">
				{#if name === '' || name === null}
					<Icon icon="mdi:cancel" style="color: var(--color-error);" />
					Cannot be blank
				{:else if name !== ''}
					<Icon icon="mdi:check" style="color: var(--color-ok);" />
				{:else}
					Loading
				{/if}
			</span>
			<br />
			<div class="commit">
				<input
					class="update"
					type="button"
					on:click={submitId}
					value={$_('config.update')}
					disabled={submitIdLoading}
				/>
				<BoxError msg={submitIdError} passive />
			</div>
		</form>
	</div>
	{#if $debugMode}
		<div class="flex-in">
			<h2>Groups</h2>
			{#if id}
				{#each id.groups as group}
					<div class="group">
						{group.name}
						(<code>{group.slug}</code>)
						<!--
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
					-->
						<details>
							<summary>{group.perms.length} perm(s)</summary>
							<ul>
								{#each group.perms as perm}
									<li>
										<code>{perm}</code>
									</li>
								{/each}
							</ul>
						</details>
					</div>
				{/each}
			{/if}
		</div>
		<div class="flex-in">
			<h2>Perms</h2>
			{#if id && id.perms}
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
									<a href={new URL(`/perms/${perm}.html`, import.meta.env.VITE_PAIMON_BASE_URL.toString()).href}><code>{perm}</code></a>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.flex-in {
		flex: 50%;
	}

	label {
		display: flex;
	}

	.img {
		display: flex;
	}

	.img .dropzone {
		flex-grow: 1;
	}

	.identity {
		display: flex;
		flex-direction: column;
	}

	.identity .label {
		flex-grow: 1;
	}

	.identity input {
		flex-grow: 1;
	}

	.identity .status {
		flex-grow: 1;
		align-self: flex-end;
	}

	.identity .commit {
		flex-grow: 1;
		align-self: flex-end;
	}

	.img {
		display: flex;
		flex-wrap: wrap;
	}

	.img > * {
		margin: 8px;
	}
</style>
