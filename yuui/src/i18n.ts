import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('./i18n/en-CA.json'));
register('ja', () => import('./i18n/ja-JP.json'));

init({
  fallbackLocale: 'ja',
  initialLocale: getLocaleFromNavigator(),
});
