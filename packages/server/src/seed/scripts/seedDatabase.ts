import { seedDatabase } from "./seedLookupTables";
import { seedRoles } from "./seedRoles";
// import { seedCoursesCsv } from "./seedCourses";
// import { seedStudentsCsv } from "./seedStudents";
// import { seedTermCoursesCsv } from "./seedCoursesDuringTerm";
// import { seedTestScoresCsv } from "./seedTestScores";

async function run() {
	await seedDatabase();
	await seedRoles();
	//   await seedCoursesCsv();
	//   await seedStudentsCsv();
	//   await seedTermCoursesCsv();
	//   await seedTestScoresCsv();
	console.log("🎉 All CSV seeders done!");
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
