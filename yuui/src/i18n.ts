import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('./i18n/en-CA.json'));
register('ja', () => import('./i18n/ja-JP.json'));

const locale = getLocaleFromNavigator();

async function start() {
  init({
    fallbackLocale: 'ja',
    initialLocale: locale,
  });
}

export { start, locale };
