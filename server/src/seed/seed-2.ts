import { faker } from "@faker-js/faker";
import { getDbConnection } from "./../db/connection"; // your drizzle client instance
import {
	students,
	instructorCourses,
	studentCourses,
	courses,
	terms,
	instructionalMethods,
	partOfTerm,
	faculty
} from "./../db/schema";
import { eq, inArray } from "drizzle-orm";

const NUM_STUDENTS = 1000;
const STUDENTS_PER_COURSE = 20;
const INSTRUCTORS = 12;
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
const TERMS = [10, 50, 80, 90]; // Spring, Summer, Fall, Winter

const GRADES = ["A", "B", "C", "D"];
const REGISTRATION_STATUS = "RE"; // Registered

async function seed() {
	console.log("Starting seed...");

	const db = (await getDbConnection()).orm;

	// --- Get lookup data from DB ---
	const courseList = await db.select().from(courses);
	const instructionalMethodList = await db.select().from(instructionalMethods);
	const partOfTermList = await db.select().from(partOfTerm);
	const termList = await db.select().from(terms);

	if (courseList.length === 0) throw new Error("No courses in DB");

	// --- Create fake students ---
	console.log("Creating students...");
	const studentMnumbers: string[] = [];
	for (let i = 0; i < NUM_STUDENTS; i++) {
		const mnumber = `M${faker.number.int({ min: 10000000, max: 99999999 })}`;
		studentMnumbers.push(mnumber);
		await db.insert(students).values({
			mnumber,
			first_name: faker.person.firstName(),
			middle_name: faker.person.middleName(),
			suffix: faker.person.suffix(),
			last_name: faker.person.lastName(),
			gender: faker.helpers.arrayElement(["M", "F"]),
			birthdate: faker.date.birthdate({ mode: "age", min: 18, max: 30 }).toISOString(),
			citizenship: faker.helpers.arrayElement(["US", "International"]),
			race_code: faker.helpers.arrayElement(["A", "B", "C", "D"]),
			race_description: faker.helpers.arrayElement([
				"Asian",
				"Black or African American",
				"Hispanic or Latino",
				"White",
				"Native American",
				"Other",
			]),
			residency_code: faker.helpers.arrayElement(["IN", "OUT"]),
			residency_description: faker.helpers.arrayElement([
				"Resident",
				"Non-Resident",
				"International",
				"Exchange",
				"Other",
			]),
			age: faker.number.int({ min: 18, max: 30 }),
			cell_phone: faker.phone.number(),
			email: faker.internet.email(),
		});
	}

	// --- Create fake instructors ---
	console.log("Creating instructors...");
	const instructorMnumbers: string[] = [];
	for (let i = 0; i < INSTRUCTORS; i++) {
		const mnumber = `M${faker.number.int({ min: 20000000, max: 29999999 })}`;
		instructorMnumbers.push(mnumber);

		await db.insert(faculty).values({
			mnumber,
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
			college: "0", // or assign faker.helpers.arrayElement(...) if you have real codes
			department: "0000", // same here
		});
	}

	// --- Seed historical course offerings ---
	let crnCounter = 10000;
	for (const year of YEARS) {
		for (const term of TERMS) {
			// Select 20 random courses per term/year
			const selectedCourses = faker.helpers.shuffle(courseList).slice(0, 20);

			for (const course of selectedCourses) {
				const crn = crnCounter++;
				const instructor = faker.helpers.arrayElement(instructorMnumbers);

				await db.insert(instructorCourses).values({
					mnumber: instructor,
					term: term.toString(), // make sure this is a string
					year, // this is fine, it's an int in the schema
					crn: crn.toString(), // text in schema, so make it a string
					course_subject: course.subject,
					course_number: course.number, // int — good
					course_suffix: course.suffix ?? "",
					course_section: faker.string.alphanumeric(4),
					role: "Instructor",
				});


				// Pick 20 students to enroll
				const enrolledStudents = faker.helpers.shuffle(studentMnumbers).slice(0, STUDENTS_PER_COURSE);

				for (const student of enrolledStudents) {
					await db.insert(studentCourses).values({
						mnumber: student,
						term: term.toString(),
						year,
						part_of_term: faker.helpers.arrayElement(partOfTermList).code,
						crn: crn.toString(),
						course_subject: course.subject,
						course_number: course.number,
						course_suffix: course.suffix ?? "",
						course_section: faker.string.alphanumeric(4),
						course_hours: course.hours,
						course_level: "UG",
						registration_status: REGISTRATION_STATUS,
						instructional_method: faker.helpers.arrayElement(instructionalMethodList).code,
						last_attendance: faker.date.past().toISOString(),
						midterm_grade: faker.helpers.arrayElement(GRADES),
						final_grade: faker.helpers.arrayElement(GRADES),
					});
				}
			}
		}
	}

	console.log("Seeding complete.");
}

seed().catch((err) => {
	console.error("Seed error:", err);
});
