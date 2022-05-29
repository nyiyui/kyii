<script lang="ts" type="module">
	import Icon from '@iconify/svelte';

	export let verified: boolean;
</script>
{#if verified}
	<Icon class="ok" icon="mdi:check-circle" aria-label="changed unverified" title="changed unverified" />
{:else}
	<Icon class="error" icon="mdi:close-circle" aria-label="changes verified" title="changes verified" />
{/if}
