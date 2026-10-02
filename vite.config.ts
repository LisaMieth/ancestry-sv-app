import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { createLogger, defineConfig } from 'vite';

// The DuckDB worker is served locally through Vite (see src/api/db.ts). Its published sourcemap
// points at apache-arrow sources outside the @duckdb/duckdb-wasm package, which Vite refuses to
// read and warns about once per file. The warnings are harmless and can only be fixed upstream,
// so we drop exactly those messages and let every other warning through.
const logger = createLogger();
const warnOnce = logger.warnOnce;
logger.warnOnce = (msg, options) => {
	if (msg.includes('Sourcemap for') && msg.includes('@duckdb/duckdb-wasm')) return;
	warnOnce(msg, options);
};

export default defineConfig({
	customLogger: logger,
	plugins: [tailwindcss(), sveltekit()],
	server: {
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'credentialless',
		},
	},
	optimizeDeps: {
		exclude: ['@duckdb/duckdb-wasm'],
	},
});
