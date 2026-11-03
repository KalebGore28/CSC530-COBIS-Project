/**
 * Turns an account into the first COBIS administrator. Run it once after deploying:
 *   1. Sign in to the deployed app with Google. The account is created disabled.
 *   2. From a copy of the repo with .env pointing at the database, run
 *        bun run db:make-admin --email you@missouristate.edu --mnumber M01234567
 *
 * It enables the account, gives it the M-number (the app won't let anyone in without one) and adds
 * the COBIS administrator role. Every other user can then be set up from the Users page.
 */
import { parseArgs } from "node:util";
import { and, eq, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { roles, user, userRoles } from "@/db/schema";

const ADMIN_ROLE = "cobis_administrator";
const MNUMBER_FORMAT = /^M\d{8}$/;

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

const { values } = parseArgs({
  options: { email: { type: "string" }, mnumber: { type: "string" } },
});
const email = values.email?.trim().toLowerCase();
const mnumber = values.mnumber?.trim().toUpperCase();

if (!email || !mnumber) {
  fail("Usage: bun run db:make-admin --email you@missouristate.edu --mnumber M01234567");
}
if (!MNUMBER_FORMAT.test(mnumber)) {
  fail(`"${mnumber}" isn't an M-number. It should be an M followed by 8 digits.`);
}

const db = getDb();

const [account] = await db.select().from(user).where(eq(user.email, email));
if (!account) {
  fail(`No account uses ${email}. Sign in to the app with it once, then run this again.`);
}

const [mnumberOwner] = await db
  .select({ email: user.email })
  .from(user)
  .where(and(eq(user.mnumber, mnumber), ne(user.id, account.id)));
if (mnumberOwner) {
  fail(`${mnumber} already belongs to ${mnumberOwner.email}.`);
}

const [adminRole] = await db.select().from(roles).where(eq(roles.name, ADMIN_ROLE));
if (!adminRole) {
  fail(`The ${ADMIN_ROLE} role doesn't exist. Run bun run db:seed first.`);
}

await db.transaction(async (tx) => {
  await tx
    .update(user)
    .set({ isEnabled: true, mnumber, updatedAt: new Date() })
    .where(eq(user.id, account.id));
  await tx.insert(userRoles).ignore().values({ user_id: account.id, role_id: adminRole.id });
});

console.log(`✅ ${email} is enabled as ${mnumber} with the ${ADMIN_ROLE} role.`);
console.log("   Reload the app; the waiting page will let you through.");
process.exit(0);
