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

// Public, whitelisted export of the prebuilt database file
const DB_FILE = 'ancestry.db';
const DB_URL = '/data/ancestry.db';

let _ready: Promise<DB> | null = null;

async function init(): Promise<DB> {
	const bundle = await duckdb.selectBundle(BUNDLES);

	const worker = new Worker(bundle.mainWorker!);
	const logger = import.meta.env.DEV ? new duckdb.ConsoleLogger() : new duckdb.VoidLogger();
	const db = new duckdb.AsyncDuckDB(logger, worker);

	try {
		await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

		// Registered by URL so DuckDB reads pages via HTTP range requests instead of loading the whole file
		const url = new URL(DB_URL, location.origin).href;
		await db.registerFileURL(DB_FILE, url, duckdb.DuckDBDataProtocol.HTTP, false);
		await db.open({ path: DB_FILE, accessMode: duckdb.DuckDBAccessMode.READ_ONLY });

		const conn = await db.connect();

		// Stop queries from reaching other URLs or installing extensions, and lock the settings so
		// they can't be turned back on from the devtools console
		await conn.query(`
			SET enable_external_access = false;
			SET autoinstall_known_extensions = false;
			SET autoload_known_extensions = false;
			SET lock_configuration = true;
		`);
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
