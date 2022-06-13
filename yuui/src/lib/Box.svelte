<script lang="ts" type="module">
	import Icon from '@iconify/svelte'
	import { debugMode } from '$lib/store'

	export let level: string
</script>

{#if level !== 'debug' || $debugMode}
	<div class="box {level}">
		{#if level === 'info'}
			<Icon icon="mdi:information-outline" />
		{:else if level === 'warn'}
			<Icon icon="mdi:alert" />
		{:else if level === 'error'}
			<Icon icon="mdi:close-circle-outline" />
		{:else if level === 'ok'}
			<Icon icon="mdi:check" />
		{:else if level === 'debug'}
			<Icon icon="mdi:bug" />
		{/if}
		<slot />
	</div>
{/if}
