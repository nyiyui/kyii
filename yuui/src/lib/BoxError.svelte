<script lang="ts" type="module">
	import Box from '../lib/Box.svelte';

	export let msg: string | null;
	export let passive: boolean;
</script>

{#if msg}
	<Box level="error">
		{msg}
	</Box>
{:else if !passive}
	<Box level="ok" />
{/if}
