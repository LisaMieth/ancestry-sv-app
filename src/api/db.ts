import * as duckdb from '@duckdb/duckdb-wasm';
import duckdbWasmMvp from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdbWorkerMvp from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdbWasmEh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import duckdbWorkerEh from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

type DB = { db: duckdb.AsyncDuckDB; conn: duckdb.AsyncDuckDBConnection };

const BUNDLES: duckdb.DuckDBBundles = {
	mvp: { mainModule: duckdbWasmMvp, mainWorker: duckdbWorkerMvp },
	eh: { mainModule: duckdbWasmEh, mainWorker: duckdbWorkerEh }
};

let _ready: Promise<DB> | null = null;

async function init(): Promise<DB> {
	const bundle = await duckdb.selectBundle(BUNDLES);

	const worker = new Worker(bundle.mainWorker!);
	const logger = import.meta.env.DEV ? new duckdb.ConsoleLogger() : new duckdb.VoidLogger();
	const db = new duckdb.AsyncDuckDB(logger, worker);

	try {
		await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

		// Registered by URL so DuckDB reads pages via HTTP range requests instead of loading the whole file
		const url = new URL('/sample.db', location.origin).href;
		await db.registerFileURL('sample.db', url, duckdb.DuckDBDataProtocol.HTTP, false);
		await db.open({ path: 'sample.db', accessMode: duckdb.DuckDBAccessMode.READ_ONLY });

		const conn = await db.connect();
		return { db, conn };
	} catch (error) {
		await db.terminate();
		throw error;
	}
}

export function getDB(): Promise<DB> {
	_ready ??= init().catch((error) => {
		_ready = null;
		throw error;
	});
	return _ready;
}
