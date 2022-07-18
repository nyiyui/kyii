<script lang="ts" type="module">
	import { _ } from 'svelte-i18n'
	import Box from '$lib/Box.svelte'
	import Select from 'svelte-select'
	import { getLocaleFromNavigator } from 'svelte-i18n'
	import { langs } from '../i18n'
	import { lang } from '$lib/store'
	import type { Lang } from '$lib/store'

	let items: Array<{ value: string; label: string }>
	let value: { value: string; label: string }

	items = [null, ...langs].map(getValue)

	$: {
		value = getValue($lang)
	}

	function choose() {
		$lang = value.value
	}

	function getValue(l: Lang) {
		if (l === null) {
			return {
				value: null,
				label: $_({
					id: 'langs.user_agent',
					values: { label: getValue(getLocaleFromNavigator()).label }
				})
			}
		}
		return { value: l, label: $_({ id: `langs.${l}`, default: '' }) || $_('langs.fallback') }
	}
</script>

<div class="langs">
	<span>{$_('langs.label')}</span>
	<div>
		<Select {items} bind:value on:select={choose} />
		<Box level="info">
			{$_('langs.help')}
		</Box>
	</div>
</div>

<style>
	.langs {
		display: flex;
	}

	.langs * {
		flex-grow: 1;
	}
</style>
