// The goal of this file is to populate the application with core data
// that is essential for its operation, such as lookup tables and roles.

import { seedLookupTables } from "./scripts/seedLookupTables";
import { seedRoles } from "./scripts/seedRoles";

async function run() {
	await seedRoles();
	await seedLookupTables();
	console.log("🎉 All CSV seeders done!");
	console.log("Your application is now seeded with core data and is ready to use!");
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
