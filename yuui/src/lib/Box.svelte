<script lang="ts" type="module">
	import Icon from '@iconify/svelte';

	export let level: string;
</script>

<div class="box {level}">
	{#if level === "info"}
		<Icon icon="mdi:information-outline" />
	{:else if level === "warn"}
		<Icon icon="mdi:alert" />
	{:else if level === "error"}
		<Icon icon="mdi:close-circle-outline" />
	{:else if level === "ok"}
		<Icon icon="mdi:check" />
	{/if}
	<slot />
</div>
