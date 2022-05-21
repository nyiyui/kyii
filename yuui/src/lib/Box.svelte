<script lang="ts" type="module">
	import Icon from '@iconify/svelte';

	export let level: string;
</script>

<div class="box">
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

{#if level === "info"}
	<style>
		.box {
			color: var(--color-info);
		}
	</style>
{:else if level === "warn"}
	<style>
		.box {
			color: var(--color-warn);
		}
	</style>
{:else if level === "error"}
	<style>
		.box {
			color: var(--color-error);
		}
	</style>
{:else if level === "ok"}
	<style>
		.box {
			color: var(--color-ok);
		}
	</style>
{/if}
