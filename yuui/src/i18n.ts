import { register, init, getLocaleFromNavigator } from 'svelte-i18n'
import { get } from 'svelte/store'
import { lang } from '$lib/store'

register('en', () => import('./i18n/en-CA.json'))
register('ja', () => import('./i18n/ja-JP.json'))

export const locale = get(lang) || getLocaleFromNavigator()

export const langs = ['en', 'ja']

export async function start() {
	init({
		fallbackLocale: 'ja',
		initialLocale: locale
	})
}
