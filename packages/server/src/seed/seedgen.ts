// The goal of this file is to generate seed data for the application
// by creating realistic fake data that can be used for testing and development.

import { seedCourses } from "./scripts/seedCourses";

async function run() {
    await seedCourses();
    console.log("🎉 All CSV gen seeders done!");
    console.log("Your application is now seeded with realistic course data and is ready to use!");
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});