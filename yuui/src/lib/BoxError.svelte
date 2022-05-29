<script lang="ts" type="module">
	import Box from '../lib/Box.svelte';

	export let msg: string;
</script>

{#if msg}
	<Box level="error">
		{msg}
	</Box>
{:else}
	<Box level="ok" />
{/if}
