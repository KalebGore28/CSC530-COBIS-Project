import { beforeAll, describe, expect, it } from "vite-plus/test";
import { eq, sql } from "drizzle-orm";
import { getDb as getTestDb } from "./helpers/db";
import { courses, programs, studentCourses, studentPrograms } from "@/db/schema";

import {
  filterStudentCoursesByAccess,
  getStudentTermAccess,
} from "@/utils/get-student-term-access";

describe("filterStudentCoursesByAccess", async () => {
  const db = getTestDb();

  // Insert one student course row with a department that matches the admin assistant's department to test that they have access to it, and that the grade data is removed.
  await db
    .insert(studentCourses)
    .values([
      {
        mnumber: "M000000083",
        term_id: "10",
        year: 2024,
        part_of_term_id: "1",
        course_id: "ADM600",
        course_section: "001",
        course_hours: 3,
        course_level: "PB",
        registration_status_id: "RE",
        instructional_method_id: "CLAS",
        instructor_mnumber: "M100000002",
        last_attendance: new Date(),
        midterm_grade: "B",
        final_grade: "A",
      },
    ])
    .onDuplicateKeyUpdate({ set: { mnumber: sql`mnumber` } });

  // Next insert a program with a department that matches the admin assistant's department and assign the admin assistant as the coordinator to ensure they have access to courses for students in that program.
  await db
    .insert(studentPrograms)
    .values([
      {
        mnumber: "M000000083",
        program_id: "C093",
        term_id: "10",
        type: "MAJOR",
        level: "UG",
        year: 2024,
      },
    ])
    .onDuplicateKeyUpdate({ set: { mnumber: sql`mnumber` } });

  beforeAll(async () => {
    // Assign the program coordinator role to the program '1070' for testing purposes
    await db.update(programs).set({ coordinator: "M100000001" }).where(eq(programs.id, "1070"));
  });

  const allStudentCourses = await db
    .select({
      mnumber: studentCourses.mnumber,
      term_id: studentCourses.term_id,
      year: studentCourses.year,
      part_of_term_id: studentCourses.part_of_term_id,
      course_id: studentCourses.course_id,
      course_section: studentCourses.course_section,
      course_hours: studentCourses.course_hours,
      course_level: studentCourses.course_level,
      registration_status_id: studentCourses.registration_status_id,
      instructional_method_id: studentCourses.instructional_method_id,
      instructor_mnumber: studentCourses.instructor_mnumber,
      last_attendance: studentCourses.last_attendance,
      midterm_grade: studentCourses.midterm_grade,
      final_grade: studentCourses.final_grade,
      department_id: courses.department_id,
    })
    .from(studentCourses)
    .innerJoin(courses, eq(studentCourses.course_id, courses.id));

  it("should correctly filter student courses for user with no roles or corresponding department", async () => {
    const userMnumber = "M100000001";

    const { students, terms } = await getStudentTermAccess(
      db,
      userMnumber,
      new Set(),
      "IRRELEVANT_DEPT",
      { bypassCache: true },
    );

    const availableCourses = filterStudentCoursesByAccess(
      userMnumber,
      "IRRELEVANT_DEPT",
      allStudentCourses,
      students,
      terms,
    );

    // We expect the user to only have access to courses where they are the instructor and/or advisor.
    expect(availableCourses.length).toEqual(676);
  });

  it("should correctly filter student courses for user with admin assistant role", async () => {
    const userMnumber = "M100000001";

    const { students, terms } = await getStudentTermAccess(
      db,
      userMnumber,
      new Set(["admin_assistant"]),
      "ESLC",
      { bypassCache: true },
    );

    const availableCourses = filterStudentCoursesByAccess(
      userMnumber,
      "ESLC",
      allStudentCourses,
      students,
      terms,
    );

    // We expect the user to have access to some courses
    expect(availableCourses.length).toEqual(677);

    // Find the course we inserted
    const insertedCourse = availableCourses.find(
      (course) =>
        course.mnumber === "M000000083" &&
        course.course_id === "ADM600" &&
        course.term_id === "10" &&
        course.year === 2024,
    );

    // We expect the inserted course to be in the results, and that the grade data is removed, but other data is intact.
    expect(insertedCourse).toBeDefined();
    expect(insertedCourse?.midterm_grade).toBeNull();
    expect(insertedCourse?.final_grade).toBeNull();
    expect(insertedCourse?.course_id).toEqual("ADM600");
    expect(insertedCourse?.instructor_mnumber).toEqual("M100000002");
  });

  it("should correctly filter student courses for user with department chair role", async () => {
    const userMnumber = "M100000001";

    const { students, terms } = await getStudentTermAccess(
      db,
      userMnumber,
      new Set(["department_chair"]),
      "ACC",
      { bypassCache: true },
    );

    const availableCourses = filterStudentCoursesByAccess(
      userMnumber,
      "ACC",
      allStudentCourses,
      students,
      terms,
    );

    // We expect the user to have access to all courses in the department
    expect(availableCourses.length).toEqual(3246);
  });

  it("should correctly filter student courses for user with program coordinator role", async () => {
    const userMnumber = "M100000001";
    // The program being tested is '1070'.

    const { students, terms } = await getStudentTermAccess(
      db,
      userMnumber,
      new Set(["program_coordinator"]),
      "ACC",
      { bypassCache: true },
    );

    const availableCourses = filterStudentCoursesByAccess(
      userMnumber,
      "ACC",
      allStudentCourses,
      students,
      terms,
    );

    // We expect the user to have access to all courses for students in their program.
    expect(availableCourses.length).toEqual(952);
  });
});
