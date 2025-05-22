import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			uuid: resolve('./node_modules/uuid')
		}
	},
	optimizeDeps: {
		include: ['uuid']
	}
});
