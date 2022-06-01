<script lang="ts" type="module">
	import { debugMode } from '$lib/store';
	import type { AfInput, ApInput } from '$lib/api2';
	import type { UUID } from "uuid";

	export let ap: ApInput;
	export let afs: Array<AfInput>;
	const afReq = new Map<UUID, boolean>();
	$: {
		for (const req of ap.reqs) {
			afReq.set(req.id, false);
		}

		const newReqs = new Array<number>();
		for (const [key, val] of afReq.entries()) {
			if (val) {
				newReqs.push(key);
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
			JSON: <code>{JSON.stringify(ap)}</code>
		{/if}
	</div>
	<form class="reqs">
		{#each afs as af}
			<label>
				{af.name}
				<input type="checkbox" bind:checked={afReq[af.uuid]}>
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
