<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Icon from '@iconify/svelte'
	import Box from '$lib/Box.svelte'
	import type { AfInput, ApInput } from '$lib/api2'
	import { doc } from '$lib/api2'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let aps: unknown
	export let ap: ApInput
	export let afs: Array<AfInput>
	export let afids
	let afReq = {}
	const afInputs = {}
	$: {
		for (const req of ap.reqs) {
			afReq[req] = true
		}
	}

	function getAfid(af: AfInput, n: number) {
		return af.uuid || afids[n]
	}

	$: {
		ap = ap
		aps = aps
	}

	function setReq(afid) {
		const value = afInputs[afid].checked
		const i = ap.reqs.indexOf(afid)
		if (value && i === -1) {
			ap.reqs.push(afid)
		} else if (!value && i !== -1) {
			ap.reqs.splice(i, 1)
		}
		afReq = afReq
	}
</script>

<div class="ap-input" id={ap.uuid}>
	<div class="name">
		<div class="top">
			<h4 contenteditable="true" bind:textContent={ap.name} />
			<input
				class="delete"
				type="button"
				on:click={() => dispatch('delete')}
				value={$_('config.delete')}
			/>
		</div>
		<Box level="debug">
			UUID: <code>{ap.uuid}</code>
			<br />
			JSON: <code>{JSON.stringify(ap)}</code>
		</Box>
		<form>
			<h5>Requires</h5>
			{#each [...afs.entries()] as [n, af]}
				<label>
					<input
						type="checkbox"
						checked={afReq[getAfid(af, n)]}
						on:change={() => setReq(getAfid(af, n))}
						bind:this={afInputs[getAfid(af, n)]}
						disabled={!getAfid(af, n)}
					/>
					{af.name}
					<a href={`#${getAfid(af, n)}`}>
						<Icon icon="mdi:link" />
					</a>
					{#if !getAfid(af, n)}
						<Box level="warn"
							>This AF is <a
								href={doc('/config.html#vafs')}
								target="blank"
								rel="noopener noreferrer">virtual</a
							>.</Box
						>
					{/if}
					<Box level="debug"><code>{getAfid(af, n)}</code></Box>
					<Box level="debug">{JSON.stringify(afReq)}</Box>
					<Box level="debug">{getAfid(af, n)}</Box>
					<Box level="debug">{af}, {n}</Box>
				</label>
				<br />
			{/each}
		</form>
	</div>
</div>

<style>
	.ap-input {
		display: flex;
	}
	/*
	@media screen and ( max-width: 600px ) {    
	  .ap-input {    
	    flex-direction: column;    
	  }    
	}
	*/
	.ap-input > div {
		flex-grow: 1;
	}

	.top {
		display: flex;
		align-items: flex-start;
	}

	.top h4 {
		flex-grow: 1;
	}
</style>
