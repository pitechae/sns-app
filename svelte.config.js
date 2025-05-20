import cloudflareAdapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Using Cloudflare adapter for Cloudflare Workers deployment
		// See https://svelte.dev/docs/kit/adapter-cloudflare for more information
		adapter: cloudflareAdapter({
			// Customize Cloudflare adapter options here if needed
			// routes: { include: ['/*'], exclude: [] },
			// esbuild: { minify: true }
		})
	}
};

export default config;
