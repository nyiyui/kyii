<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Icon from '@iconify/svelte'
</script>

<span class="tag ok">
	<Icon icon="mdi:lock" />
	{$_('private.title')}
</span>
