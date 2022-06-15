<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'

	export let name: string
</script>

{$_(`oauth2.scopes.${name}`)}
(<code>{name}</code>)
