import { Query, and, eq } from "@tanstack/react-db";

import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { facultyCollection } from "@/integrations/tanstack-db/faculty";
import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";
import { studentCoursesCollection } from "@/integrations/tanstack-db/student-courses";
import { studentsCollection } from "@/integrations/tanstack-db/students";
import { termsCollection } from "@/integrations/tanstack-db/terms";
import { usersCollection } from "@/integrations/tanstack-db/users";

type Term = { year: number; term_id: string };

/**
 * One instructor's name, department and email.
 */
export function instructorProfileQuery(mnumber: string) {
  return new Query()
    .from({ faculty: facultyCollection })
    .leftJoin({ departments: departmentsCollection }, ({ faculty, departments }) =>
      eq(faculty.department_id, departments.id),
    )
    .leftJoin({ users: usersCollection }, ({ faculty, users }) =>
      eq(faculty.mnumber, users.mnumber),
    )
    .where(({ faculty }) => eq(faculty.mnumber, mnumber))
    .select(({ faculty, departments, users }) => ({
      first_name: faculty.first_name,
      last_name: faculty.last_name,
      department: departments?.description,
      email: users?.email,
    }))
    .findOne();
}

/**
 * Every registration in every section an instructor has taught, one row per student, with the
 * course title and term name. The teaching history and the roster's section list both read this.
 */
export function instructorRegistrationsQuery(instructorMnumber: string) {
  return new Query()
    .from({ studentCourses: studentCoursesCollection })
    .innerJoin({ courses: coursesCollection }, ({ studentCourses, courses }) =>
      eq(studentCourses.course_id, courses.id),
    )
    .leftJoin({ terms: termsCollection }, ({ studentCourses, terms }) =>
      eq(studentCourses.term_id, terms.id),
    )
    .where(({ studentCourses }) => eq(studentCourses.instructor_mnumber, instructorMnumber))
    .select(({ studentCourses, courses, terms }) => ({
      mnumber: studentCourses.mnumber,
      year: studentCourses.year,
      term_id: studentCourses.term_id,
      term_description: terms?.description,
      course_id: studentCourses.course_id,
      section: studentCourses.course_section,
      title: courses.title,
      hours: studentCourses.course_hours,
      status_id: studentCourses.registration_status_id,
      final_grade: studentCourses.final_grade,
      grades_visible: studentCourses.grades_visible,
    }));
}

/**
 * The students registered in one section, drops and withdrawals included, with their grades.
 */
export function sectionRosterQuery(
  instructorMnumber: string,
  term: Term,
  courseId: string,
  section: string,
) {
  return (
    new Query()
      .from({ studentCourses: studentCoursesCollection })
      // Inner, so a row only shows once its student has loaded and never has a blank name
      .innerJoin({ students: studentsCollection }, ({ studentCourses, students }) =>
        eq(studentCourses.mnumber, students.mnumber),
      )
      .leftJoin({ statuses: registrationStatusCollection }, ({ studentCourses, statuses }) =>
        eq(studentCourses.registration_status_id, statuses.id),
      )
      .where(({ studentCourses }) =>
        and(
          eq(studentCourses.instructor_mnumber, instructorMnumber),
          eq(studentCourses.year, term.year),
          eq(studentCourses.term_id, term.term_id),
          eq(studentCourses.course_id, courseId),
          eq(studentCourses.course_section, section),
        ),
      )
      .select(({ studentCourses, students, statuses }) => ({
        mnumber: studentCourses.mnumber,
        first_name: students.first_name,
        last_name: students.last_name,
        suffix: students.suffix,
        email: students.email,
        hours: studentCourses.course_hours,
        status_id: studentCourses.registration_status_id,
        status: statuses?.description,
        midterm_grade: studentCourses.midterm_grade,
        final_grade: studentCourses.final_grade,
        grades_visible: studentCourses.grades_visible,
        last_attendance: studentCourses.last_attendance,
      }))
  );
}
