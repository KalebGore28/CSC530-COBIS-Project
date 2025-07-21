import { getDbConnection } from "../../db/connection";
import { roles } from "../../db/schema";

const ROLE_DEFINITIONS = [
  { id: 1, name: "faculty" },
  { id: 2, name: "advisor" },
  { id: 3, name: "program_coordinator" },
  { id: 4, name: "department_chair" },
  { id: 5, name: "administrator" },
  { id: 6, name: "cobis_administrator" },
];

export async function seedRoles() {
  const { orm: db } = await getDbConnection();
  console.log("Seeding roles…");

  try {
    await db.insert(roles).values(ROLE_DEFINITIONS);
    console.log(`✅ Inserted ${ROLE_DEFINITIONS.length} roles.`);
  } catch (err: any) {
    if (err.cause.code === 'ER_DUP_ENTRY') {
      console.warn("⚠️ Some roles already exist. Skipping duplicates.");
    } else {
      console.error("❌ Failed to insert roles:", err);
      // throw err; // Re-throw unknown errors
    }
  }
}


// If you want to run this file directly with ts-node:
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRoles()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Error seeding roles:", err);
      process.exit(1);
    });
}
