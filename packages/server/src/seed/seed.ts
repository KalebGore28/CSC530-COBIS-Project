import { seedLookupTables } from "./scripts/seedLookupTables";
import { seedRoles } from "./scripts/seedRoles";

async function run() {
	await seedLookupTables();
	await seedRoles();
	console.log("🎉 All CSV seeders done!");
	console.log("Your application is now seeded with core data and is ready to use!");
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
