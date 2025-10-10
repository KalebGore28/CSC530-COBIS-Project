import { getDbConnection } from "../db"; // adjust path as needed
import * as schema from "../db/schema"; // adjust path as needed

// Internal singleton map (private)
let prefixMap: Map<string, { dept: string; coll: string }> | null = null;

/**
 * Loads the course prefixes from the database into a singleton prefix map.
 * You MUST call this before accessing the map.
 */
export async function loadPrefixMap(forceReload = false) {
  if (prefixMap && !forceReload) {
    return;
  }

  const { orm: db } = await getDbConnection();
  const rows = await db.select().from(schema.coursePrefixes);

  prefixMap = new Map(
    rows.map((r) => [r.prefix, { dept: r.department, coll: r.college }]),
  );
}

/**
 * Access the current prefix map. Must call `loadPrefixMap()` first.
 */
export function getPrefixMap(): Map<string, { dept: string; coll: string }> {
  if (!prefixMap) {
    throw new Error("❌ Prefix map not loaded. Call loadPrefixMap() first.");
  }
  return prefixMap;
}

/**
 * Adds or updates a prefix entry in both the database and in-memory map.
 */
export async function updatePrefixMap(
  prefix: string,
  department: string,
  college: string,
) {
  if (!prefix || !department || !college) {
    throw new Error("Prefix, department, and college must all be provided");
  }

  const map = getPrefixMap();

  if (map.has(prefix)) {
    console.warn(
      `⚠️ Prefix "${prefix}" already exists. Updating existing entry.`,
    );
  }

  const { orm: db } = await getDbConnection();

  await db
    .insert(schema.coursePrefixes)
    .values({ prefix, department, college })
    .onDuplicateKeyUpdate({
      set: { department, college },
    });

  map.set(prefix, { dept: department, coll: college });
}

/**
 * Clears the prefix map from memory. Useful for testing or reloads.
 */
export function resetPrefixMap() {
  prefixMap = null;
}
