import fs from "node:fs";
import path from "node:path";
import { roleCapabilities, roleDataAccess } from "../schema";
import { parseCSV } from "../../utils/csv-importer/parse-csv";
import type { getDb } from "..";
import type { DataCategory, DataRelationship } from "../../types/access-checks";

async function readPolicyCSV(fileName: string) {
  const fileContent = fs.readFileSync(path.join("src/db/seed/csvs", fileName), "utf8");
  const parsedData = await parseCSV(fileContent);
  return parsedData.data;
}

/**
 * Loads the starting permissions. Each table is only filled while it is empty,
 * so running this again can't undo changes made on the permissions page.
 */
export async function seedPolicy(db: ReturnType<typeof getDb>) {
  const existingDataAccess = await db.select().from(roleDataAccess).limit(1);
  if (existingDataAccess.length === 0) {
    const rows = await readPolicyCSV("role_data_access.csv");
    await db.insert(roleDataAccess).values(
      rows.map((row) => ({
        role_id: Number(row.ROLE_ID),
        relationship: row.RELATIONSHIP as DataRelationship,
        category: row.CATEGORY as DataCategory,
      })),
    );
  }

  const existingCapabilities = await db.select().from(roleCapabilities).limit(1);
  if (existingCapabilities.length === 0) {
    const rows = await readPolicyCSV("role_capabilities.csv");
    await db.insert(roleCapabilities).values(
      rows.map((row) => ({
        role_id: Number(row.ROLE_ID),
        capability: row.CAPABILITY,
      })),
    );
  }
}
