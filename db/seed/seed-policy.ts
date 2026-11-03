import { roleCapabilities, roleDataAccess } from "@/db/schema";
import { readSeedCSV } from "./read-seed-csv";
import type { getDb } from "@/db";
import type { DataCategory, DataRelationship } from "@/types/access-checks";

type Db = ReturnType<typeof getDb>;

/**
 * The starting data access for each role. Only filled while the table is empty, so running
 * this again can't put back boxes someone unticked on the permissions page.
 * Returns how many rows it added.
 */
export async function seedRoleDataAccess(db: Db) {
  const existing = await db.select().from(roleDataAccess).limit(1);
  if (existing.length > 0) return 0;

  const rows = await readSeedCSV("role_data_access.csv");
  await db.insert(roleDataAccess).values(
    rows.map((row) => ({
      role_id: Number(row.ROLE_ID),
      relationship: row.RELATIONSHIP as DataRelationship,
      category: row.CATEGORY as DataCategory,
    })),
  );
  return rows.length;
}

/**
 * The starting capabilities for each role. Only filled while the table is empty, like above.
 * Returns how many rows it added.
 */
export async function seedRoleCapabilities(db: Db) {
  const existing = await db.select().from(roleCapabilities).limit(1);
  if (existing.length > 0) return 0;

  const rows = await readSeedCSV("role_capabilities.csv");
  await db
    .insert(roleCapabilities)
    .values(rows.map((row) => ({ role_id: Number(row.ROLE_ID), capability: row.CAPABILITY })));
  return rows.length;
}
