<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Icon from '@iconify/svelte'
</script>

<span class="tag warn">
	<Icon icon="mdi:earth" />
	{$_('public.title')}
</span>
