import { getDB } from './db.js';

export interface Ancestor {
	ancestor_id: string,
	ancestor_full_name: string,
	ancestor_location_name: string,
	ancestor_geolocation: [number, number],
	ancestor_date_ref: string,
}

let _ancestors: Promise<Ancestor[]> | null = null;

// export async function getFamilyBranches() {
// 	const { conn } = await getDB();
// 	const result = await conn.query('SELECT * FROM fct_family_branch LIMIT 10');
// 	return result.toArray().map((row) => row.toJSON());
// }

async function queryAllAncestors(): Promise<Ancestor[]> {
	const { conn } = await getDB();
	const result = await conn.query(`
		SELECT
			ancestor_id,
			ancestor_full_name,
			ancestor_location_name,
			ancestor_geolocation,
			ancestor_date_ref
		FROM fct_family_branch
		WHERE ancestor_geolocation IS NOT NULL
	`);
	return result.toArray().map((row) => ({
		ancestor_id: row.ancestor_id,
		ancestor_full_name: row.ancestor_full_name,
		ancestor_location_name: row.ancestor_location_name,
		ancestor_geolocation: Array.from(row.ancestor_geolocation as Iterable<number>) as [number, number],
		ancestor_date_ref: row.ancestor_date_ref
	}));
}

export function getAllAncestors(): Promise<Ancestor[]> {
	_ancestors ??= queryAllAncestors().catch((error) => {
		_ancestors = null;
		throw error;
	});
	return _ancestors;
}
