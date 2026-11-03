/**
 * The one-time seed for a new deployment: the roles, their permissions and the code tables the
 * app needs before anything is imported. It adds no students, faculty, courses or programs; those
 * come from the import page. Safe to run again, since it never changes or removes existing rows.
 *
 * Run it from a copy of the repo after the migrations, with .env pointing at the new database:
 *   bun run db:seed
 */
import { getDb } from "@/db";
import { seedDeployment } from "./seed-deployment";

try {
  await seedDeployment(getDb());
  console.log("✅ Deployment seed done. Rows already in the database were left as they were.");
  process.exit(0);
} catch (error) {
  console.error("❌ Deployment seed failed:", error);
  process.exit(1);
}
