import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// Client-only SPA (ssr = false), built as static files and run locally
		adapter: adapter({ fallback: 'index.html' }),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				// DuckDB compiles its .wasm module at runtime
				'script-src': ['self', 'wasm-unsafe-eval'],
				'worker-src': ['self'],
				'connect-src': ['self'],
				'img-src': ['self', 'data:', 'https://tile.openstreetmap.org'],
				// Vite injects <style> tags in dev; Leaflet sets inline styles
				'style-src': ['self', 'unsafe-inline'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self']
			}
		}
	}
};

export default config;
