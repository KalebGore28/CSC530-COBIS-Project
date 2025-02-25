// seedTestData.ts (or any name you prefer)

import { db } from "./db/connection"; // Update path to your Drizzle DB connection
import { users } from "./db/models/users";
import { instructorCourses } from "./db/models/instructor_courses";

async function seedTestData() {
  // 1) Insert a test instructor user
  await db.insert(users).values({
    id: "instructor_1",
    email: "instructor1@murraystate.edu",
    display_name: "Instructor One",
    is_active: true,
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString(),
    // If you have an updated_at field or anything else, include them here
  });

  // 2) Insert instructor courses referencing existing course records in student_courses
  //    Adjust subject, number, suffix, term, and year to match your actual student_courses data
  await db.insert(instructorCourses).values({
    user_id: "instructor_1",
    term: "10",         // Must match student_courses.term_code
    year: 2023,         // Must match student_courses.year
    course_subject: "ACC",
    course_number: "200", // If your DB schema uses int for 'number'
    course_suffix: "",  // Default if you don't have a suffix
    role: "Instructor",
  });

  await db.insert(instructorCourses).values({
    user_id: "instructor_1",
    term: "50",
    year: 2023,
    course_subject: "ENG",
    course_number: "101",
    course_suffix: "",
    role: "Instructor",
  });

  await db.insert(instructorCourses).values({
    user_id: "instructor_1",
    term: "80",
    year: 2023,
    course_subject: "MAT",
    course_number: "215",
    course_suffix: "",
    role: "Instructor",
  });

  await db.insert(instructorCourses).values({
    user_id: "instructor_1",
    term: "10",
    year: 2024,
    course_subject: "CSC",
    course_number: "301",
    course_suffix: "",
    role: "Instructor",
  });

  await db.insert(instructorCourses).values({
    user_id: "instructor_1",
    term: "50",
    year: 2024,
    course_subject: "BUS",
    course_number: "442",
    course_suffix: "",
    role: "Instructor",
  });

  console.log("Test data inserted successfully!");
}

// Run the seed function (e.g., `node seedTestData.js` or `ts-node seedTestData.ts`)
seedTestData()
  .then(() => {
    console.log("Seeding complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding test data:", err);
    process.exit(1);
  });