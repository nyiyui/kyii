<script lang="ts" type="module">
	import { page } from '$app/stores';
	import { client } from '$lib/api2';
</script>

<img
	alt="profile"
	src={new URL(`api/v2/user/${$page.params.uid}/img`, client.baseUrl).toString()}
/>
User
<code>{$page.params.uid}</code>

<style>
	img {
		width: 3em;
		height: auto;
		border-radius: 50%;
	}
</style>
