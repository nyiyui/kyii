import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),
	kit: {
		trailingSlash: 'always',
    adapter: adapter({
      // default options are shown
      pages: 'build',
      assets: 'build',
      fallback: null,
      precompress: false
    }),
		prerender: {
			default: true,
		},
		trailingSlash: 'always',
	}
};

export default config;
