<script lang="ts" type="module">
	import { debugMode } from '$lib/store';
	import type { AfInput, ApInput } from '$lib/api';

	export let ap: ApInput;
	export let afs: Map<number, AfInput>;
	const afReq = new Array<boolean>();
	$: {
		for (const i in ap.reqs) {
			afReq[ap.reqs[i]] = true;
		}

		const newReqs = new Array<number>();
		for (const n in afReq) {
			if (afReq[n]) {
				newReqs.push(Number.parseInt(n));
			}
		}
		ap.reqs = newReqs;
	}
</script>

<div class="ap-input" id={ap.uuid}>
	<div class="name">
		<label>
			Name
			<input type="text" bind:value={ap.name} />
		</label>
		{#if $debugMode}
			<br/>
			UUID: <code>{ap.uuid}</code>
		{/if}
	</div>
	<form class="reqs">
		{#each [...afs] as [n, af]}
			<label>
				{af.name}
				<input type="checkbox" bind:checked={afReq[n]}>
			</label>
			<br />
		{/each}
	</form>
</div>

<style>
	.ap-input {
		display: flex;
	}
	@media screen and ( max-width: 1200px ) {    
	  .ap-input {    
	    flex-direction: column;    
	  }    
	}
	.ap-input > div {
		flex: 50%;
	}
	.reqs {
		text-align: right;
	}
</style>
