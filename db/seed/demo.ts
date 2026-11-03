/**
 * Fills a database with made-up College of Business data, for development and demonstrations.
 * Never run it against a real database: it empties every table except the sign-in ones first.
 *
 *   bun run db:seed-demo
 *
 * It runs the deployment seed, loads the course catalog and programs, then simulates students
 * from SIMULATE_FROM to CURRENT_TERM and writes out everything from SHOW_FROM on. The same
 * RANDOM_SEED always gives the same data.
 */
import { eq } from "drizzle-orm";
import { reset } from "drizzle-seed";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { seedDeployment } from "./seed-deployment";
import { insertCourses, insertPrograms, readCourses, readPrograms } from "./demo/catalog";
import { BUSINESS_FACULTY_COUNTS, generateFaculty } from "./demo/faculty";
import { pick, setRandomSeed } from "./demo/random";
import { simulateStudents } from "./demo/students";
import { termsBetween } from "./demo/terms";

const RANDOM_SEED = 12345;
// A few years of history before the first term shown, so every class level is there from the start
const SIMULATE_FROM = { year: 2017, term_id: "80" };
const SHOW_FROM = { year: 2021, term_id: "10" };
// The term in progress: it has midterm grades but no final grades yet
const CURRENT_TERM = { year: 2026, term_id: "80" };
// Rows per insert, to stay well under MySQL's limit on values in one statement
const CHUNK = 2000;

// The account the local dev sign-in creates
const DEV_USER_ID = "dev-user";

async function seedDemo() {
  const db = getDb();
  setRandomSeed(RANDOM_SEED);

  console.log("Emptying every table except the sign-in ones...");
  await reset(db, {
    ...schema,
    user: undefined,
    session: undefined,
    account: undefined,
    verification: undefined,
    userRoles: undefined,
  });

  console.log("Deployment seed:");
  await seedDeployment(db);

  const courses = await readCourses();
  await insertCourses(db, courses);
  console.log(`courses: ${courses.length}`);

  const departments = await db.select().from(schema.departments);
  const faculty = generateFaculty(new Map(departments.map((d) => [d.id, d.college_id])));
  await db.insert(schema.faculty).values(faculty);
  console.log(`faculty: ${faculty.length}`);

  // Each Business program gets a coordinator from its department
  const programs = await readPrograms();
  for (const program of programs) {
    const department = program.department_id === "BPA" ? "MMB" : program.department_id;
    if (program.college_id !== "BP" || !department || !(department in BUSINESS_FACULTY_COUNTS))
      continue;
    const members = faculty.filter((member) => member.department_id === department);
    program.coordinator = pick(members).mnumber;
  }
  await insertPrograms(db, programs);
  console.log(`programs: ${programs.length}`);

  console.log("Simulating students...");
  const simulation = simulateStudents({
    terms: termsBetween(SIMULATE_FROM, CURRENT_TERM),
    firstVisibleTerm: SHOW_FROM,
    courses,
    programs,
    faculty,
  });

  for (let i = 0; i < simulation.students.length; i += CHUNK) {
    await db.insert(schema.students).values(simulation.students.slice(i, i + CHUNK));
  }
  console.log(`students: ${simulation.students.length}`);

  for (let i = 0; i < simulation.studentCourses.length; i += CHUNK) {
    await db.insert(schema.studentCourses).values(simulation.studentCourses.slice(i, i + CHUNK));
  }
  console.log(`student courses: ${simulation.studentCourses.length}`);

  for (let i = 0; i < simulation.academicInfo.length; i += CHUNK) {
    await db.insert(schema.studentAcademicInfo).values(simulation.academicInfo.slice(i, i + CHUNK));
  }
  console.log(`academic info: ${simulation.academicInfo.length}`);

  for (let i = 0; i < simulation.studentPrograms.length; i += CHUNK) {
    await db.insert(schema.studentPrograms).values(simulation.studentPrograms.slice(i, i + CHUNK));
  }
  console.log(`student programs: ${simulation.studentPrograms.length}`);

  for (let i = 0; i < simulation.advisors.length; i += CHUNK) {
    await db.insert(schema.studentAdvisors).values(simulation.advisors.slice(i, i + CHUNK));
  }
  console.log(`advisors: ${simulation.advisors.length}`);

  // The dev account keeps its roles, but its old M-number is gone, so it becomes the first
  // Accounting faculty member. Without a dev account yet, the dev sign-in picks the same one.
  await db
    .update(schema.user)
    .set({ mnumber: faculty[0].mnumber })
    .where(eq(schema.user.id, DEV_USER_ID));
  console.log(`dev account: ${faculty[0].mnumber} (${faculty[0].department_id})`);
}

try {
  const started = Date.now();
  await seedDemo();
  console.log(`✅ Demo data seeded in ${Math.round((Date.now() - started) / 1000)}s.`);
  process.exit(0);
} catch (error) {
  console.error("❌ Demo seed failed:", error);
  process.exit(1);
}
