import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		imagetools(),
		sveltekit()
	],
	build: {
		assetsInlineLimit: 0,
	}
});
