<script lang="ts" type="module">
	export let uid: string;
	export let name: string;
	export let slug: string;
</script>

{#if uid}
<a href="/user/{uid}">
	{name}
	(<code>{slug}</code>)
</a>
{:else}
<a href="/user/anonymous">
	<em>Anonymous</em>
</a>
{/if}
