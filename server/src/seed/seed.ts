import { faker } from "@faker-js/faker";
import { getDbConnection } from "../db/connection"; // your drizzle client instance
import { sql } from "drizzle-orm"; // Import sql for check constraints if needed
import { seedDatabase } from "./csvs";

import {
	students,
	instructorCourses,
	studentCourses,
	courses,
	terms,
	instructionalMethods,
	partOfTerm,
	faculty,
	// Import the new table schemas
	studentAcademicInfo,
	studentAddresses,
	studentAdvisors,
	studentPrograms,
	testScores,
	// Assuming these schemas exist and are imported (add actual imports if needed)
	admitCodes,
	academicStanding,
	nations,
	programs,
	roles
} from "../db/schema";

const NUM_STUDENTS = 1000;
const STUDENTS_PER_COURSE = 20;
const INSTRUCTORS = 12;
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
const TERMS = [10, 50, 80, 90]; // Spring, Summer, Fall, Winter - Assuming these are codes like '10', '50' etc.

const GRADES = ["A", "B", "C", "D", "F", "W"]; // Added F and W for realism
const REGISTRATION_STATUS = "RE"; // Registered

// --- Helper Function for GPA/Hours Calculation ---
function generateAcademicMetrics(baseHours = 0, basePoints = 0) {
	const attemptedHours = faker.number.float({ min: 0, max: 18 });
	const earnedHoursRatio = faker.number.float({ min: 0.8, max: 1.0 }); // Most hours attempted are earned
	const earnedHours = parseFloat((attemptedHours * earnedHoursRatio).toFixed(1));
	// Simple GPA calculation (e.g., A=4, B=3, C=2, D=1, F=0)
	const qualityPoints = parseFloat(
		(earnedHours * faker.number.float({ min: 2.0, max: 4.0 })).toFixed(2)
	);
	const gpa = earnedHours > 0 ? parseFloat((qualityPoints / earnedHours).toFixed(2)) : 0;

	const overallAttempted = baseHours + attemptedHours;
	const overallEarned = baseHours + earnedHours;
	const overallPoints = basePoints + qualityPoints;
	const overallGpa = overallEarned > 0 ? parseFloat((overallPoints / overallEarned).toFixed(2)) : 0;


	return {
		attempted_hours: attemptedHours,
		earned_hours: earnedHours,
		quality_points: qualityPoints,
		gpa: gpa,
		overall_attempted_hours: overallAttempted,
		overall_earned_hours: overallEarned,
		overall_quality_points: overallPoints,
		overall_gpa: overallGpa,
	};
}


async function seed() {
	console.log("Starting seed...");


	const db = (await getDbConnection()).orm;

	// seed the roles table
	await db.insert(roles).values([
		{ id: 1, name: "faculty" },
		{ id: 2, name: "advisor" },
		{ id: 3, name: "program_coordinator" },
		{ id: 4, name: "department_chair" },
		{ id: 5, name: "administrator" },
		{ id: 6, name: "cobis_administrator" },
	]);

	await seedDatabase(); // Seed the database with CSV data

	// --- Get lookup data from DB ---
	console.log("Fetching lookup data...");
	const courseList = await db.select().from(courses);
	const instructionalMethodList = await db.select().from(instructionalMethods);
	const partOfTermList = await db.select().from(partOfTerm);
	const termList = await db.select().from(terms);

	// --- Fetch or define placeholders for NEW lookup tables ---
	let admitCodeList = await db.select().from(admitCodes).limit(10); // Fetch some admit codes
	if (admitCodeList.length === 0) {
		console.warn("No admit codes found in DB, using placeholders.");
		// You might want to insert some default codes if the table is empty
		admitCodeList = [{ code: "FT", description: "First Time Freshman" }, { code: "TR", description: "Transfer" }];
	}

	let academicStandingList = await db.select().from(academicStanding).limit(10); // Fetch some academic standings
	if (academicStandingList.length === 0) {
		console.warn("No academic standings found in DB, using placeholders.");
		academicStandingList = [{ code: "GS", description: "Good Standing" }, { code: "AW", description: "Academic Warning" }];
	}

	let nationList = await db.select().from(nations).limit(10); // Fetch some nations
	if (nationList.length === 0) {
		console.warn("No nations found in DB, using placeholders.");
		nationList = [{ code: "USA", description: "United States" }, { code: "CAN", description: "Canada" }];
	}

	let programList = await db.select().from(programs).limit(20); // Fetch some programs
	if (programList.length === 0) {
		console.warn("No programs found in DB, using placeholders.");
		programList = [
			{ code: "CSCI", description: "Computer Science", cip_code: "52934", is_major: true, is_minor: false, has_concentration: false, is_discontinued: false, is_aacsb: false, department: "0000", college: "0", added_on: "" },
		];
	}

	// --- Error checks for essential data ---
	if (courseList.length === 0) throw new Error("No courses found in DB. Cannot proceed.");
	if (termList.length === 0) throw new Error("No terms found in DB. Cannot proceed.");


	// --- Create fake students ---
	console.log(`Creating ${NUM_STUDENTS} students...`);
	const studentMnumbers: string[] = [];
	const studentDataMap = new Map<string, { firstTerm: number, firstYear: number }>(); // Store admit term/year per student

	for (let i = 0; i < NUM_STUDENTS; i++) {
		const mnumber = `M${faker.number.int({ min: 10000000, max: 99999999 })}`;
		studentMnumbers.push(mnumber);

		// Determine a plausible first term/year for the student
		const firstYear = faker.helpers.arrayElement(YEARS.slice(0, -1)); // Can't start in the current year usually
		const firstTerm = faker.helpers.arrayElement(TERMS); // Any term
		studentDataMap.set(mnumber, { firstTerm, firstYear });

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
				"Asian",
				"American Indian or Alaska Native",
				"Native Hawaiian or Other Pacific Islander",
				"Two or more races",
				"Unknown",
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
			email: faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName() }), // Use names for more realistic email
		});
	}

	// --- Create fake instructors ---
	console.log(`Creating ${INSTRUCTORS} instructors...`);
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

	// --- Seed Student Specific Data (Addresses, Programs, Advisors, Test Scores, Academic Info) ---
	console.log("Seeding student-specific data (addresses, programs, etc.)...");
	for (const mnumber of studentMnumbers) {
		const studentInfo = studentDataMap.get(mnumber);
		if (!studentInfo) continue; // Should not happen, but safety check

		const { firstTerm, firstYear } = studentInfo;

		// --- Seed Student Addresses (Home and maybe Local) ---
		await db.insert(studentAddresses).values({
			mnumber: mnumber,
			type: "HOME", // Home address
			street1: faker.location.streetAddress(),
			street2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.2 }), // Optional street2
			city: faker.location.city(),
			state: faker.location.state({ abbreviated: true }),
			zip: faker.location.zipCode("#####"), // Basic 5 digit zip
			nation_code: faker.helpers.arrayElement(nationList).code, // Use fetched/placeholder nations
			phone: faker.phone.number(),
		}).onConflictDoNothing(); // Ignore if primary key conflict (mnumber, type)

		// Add a local address sometimes (e.g., 70% chance)
		if (Math.random() < 0.7) {
			await db.insert(studentAddresses).values({
				mnumber: mnumber,
				type: "LOCAL", // Local address
				street1: faker.location.streetAddress(),
				street2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.2 }),
				city: faker.location.city(), // Could be same city or different
				state: faker.location.state({ abbreviated: true }),
				zip: faker.location.zipCode("#####"),
				nation_code: "55913", // Assume local address is mostly US
				phone: faker.phone.number(),
			}).onConflictDoNothing(); // Ignore if primary key conflict (mnumber, type)
		}


		// --- Seed Student Programs (Major, maybe Minor) ---
		const majorProgram = faker.helpers.arrayElement(programList);
		const studentLevel = faker.helpers.arrayElement(["UG", "GR", "PB"]); // Undergraduate, Graduate, Post-Bacc

		await db.insert(studentPrograms).values({
			mnumber: mnumber,
			term: firstTerm.toString(), // Program usually tied to admit term initially
			year: firstYear,
			type: "MAJOR",
			level: studentLevel,
			program: majorProgram.code,
		}).onConflictDoNothing(); // Ignore PK conflict (mnumber, type, program) - prevents duplicate majors

		// Add a minor sometimes (e.g., 30% chance, only for UG/PB)
		if (studentLevel !== "GR" && Math.random() < 0.3) {
			const minorProgram = faker.helpers.arrayElement(programList.filter(p => p.code !== majorProgram.code)); // Different from major
			if (minorProgram) {
				await db.insert(studentPrograms).values({
					mnumber: mnumber,
					term: firstTerm.toString(), // Can add logic to assign minor later if needed
					year: firstYear,
					type: "MINOR",
					level: studentLevel,
					program: minorProgram.code,
				}).onConflictDoNothing(); // Ignore PK conflict
			}
		}

		// --- Seed Student Advisors ---
		// Assign one primary advisor initially for their first term/year
		const advisorMnumber = faker.helpers.arrayElement(instructorMnumbers);
		await db.insert(studentAdvisors).values({
			student_mnumber: mnumber,
			term: firstTerm.toString(),
			year: firstYear,
			advisor_mnumber: advisorMnumber,
		}).onConflictDoNothing(); // Ignore PK conflict


		// --- Seed Test Scores ---
		const numTestScores = faker.number.int({ min: 1, max: 4 }); // Student might have 1 to 4 test scores on file
		const testTypes = [
			{ code: "SATC", description: "SAT Combined", min: 800, max: 1600 },
			{ code: "ACTC", description: "ACT Composite", min: 15, max: 36 },
			{ code: "TOEFL", description: "TOEFL Internet Based", min: 60, max: 120 },
			{ code: "GREV", description: "GRE Verbal", min: 130, max: 170 },
			{ code: "GREM", description: "GRE Math", min: 130, max: 170 }
		];

		const selectedTests = faker.helpers.shuffle(testTypes).slice(0, numTestScores);
		for (const test of selectedTests) {
			// Test date should be before their first term
			const testDate = faker.date.past({ years: 2, refDate: new Date(firstYear, firstTerm === 10 ? 0 : (firstTerm === 50 ? 4 : (firstTerm === 80 ? 7 : 10)), 1) }).toISOString().split('T')[0]; // Approx start date of term
			await db.insert(testScores).values({
				mnumber: mnumber,
				code: test.code,
				description: test.description,
				score: faker.number.int({ min: test.min, max: test.max }),
				date: testDate,
			}).onConflictDoNothing(); // Ignore PK conflict (mnumber, code, date)
		}

		// --- Seed Student Academic Info (Initial Record) ---
		// For simplicity, we'll create one initial record based on their admit term/year
		// In a more complex scenario, you'd create records for each active term/year
		const metrics = generateAcademicMetrics(); // Generate initial metrics (mostly 0)
		await db.insert(studentAcademicInfo).values({
			mnumber: mnumber,
			term: firstTerm.toString(),
			year: firstYear,
			admit_term: firstTerm.toString(),
			admit_year: firstYear,
			admit_code: faker.helpers.arrayElement(admitCodeList).code,
			academic_standing: "GS", // Assume good standing initially
			msu_attempted_hours: 0, // Start at 0 for the first term entry usually
			msu_earned_hours: 0,
			msu_quality_points: 0,
			msu_gpa: 0,
			overall_attempted_hours: 0,
			overall_earned_hours: 0,
			overall_quality_points: 0,
			overall_gpa: 0,
		}).onConflictDoNothing(); // Ignore PK conflict (mnumber, term, year)

	}


	// --- Seed historical course offerings and student enrollments ---
	console.log("Seeding course offerings and enrollments...");
	let crnCounter = 10000;
	let currentOverallHours = new Map<string, number>(); // Track overall hours per student
	let currentOverallPoints = new Map<string, number>(); // Track overall points per student

	for (const year of YEARS) {
		for (const term of TERMS) {
			console.log(`Processing Term: ${term}, Year: ${year}`);
			// Select ~30 random courses per term/year
			const coursesThisTerm = faker.helpers.shuffle(courseList).slice(0, faker.number.int({ min: 25, max: 35 }));

			for (const course of coursesThisTerm) {
				const crn = crnCounter++;
				const instructor = faker.helpers.arrayElement(instructorMnumbers);
				const section = faker.string.alphanumeric(3).toUpperCase(); // e.g., 001, H01

				// Insert the course offering by the instructor
				await db.insert(instructorCourses).values({
					mnumber: instructor,
					term: term.toString(),
					year: year,
					crn: crn.toString(),
					course_subject: course.subject,
					course_number: course.number,
					course_suffix: course.suffix ?? "",
					course_section: section,
					role: "PI", // Primary Instructor
				}).onConflictDoNothing();


				// Enroll students who *could* have been active in this term/year
				// Filter students whose first term/year is <= current term/year
				const potentiallyActiveStudents = studentMnumbers.filter(mn => {
					const info = studentDataMap.get(mn);
					return info && (info.firstYear < year || (info.firstYear === year && info.firstTerm <= term));
				});

				// Avoid enrolling too many students if the pool is small
				const maxEnrollment = Math.min(STUDENTS_PER_COURSE, potentiallyActiveStudents.length);
				if (maxEnrollment === 0) continue; // Skip if no eligible students

				// Shuffle the eligible students and pick some to enroll
				const enrolledStudents = faker.helpers.shuffle(potentiallyActiveStudents).slice(0, faker.number.int({ min: 5, max: maxEnrollment }));

				for (const studentMnumber of enrolledStudents) {
					const finalGrade = faker.helpers.arrayElement(GRADES);
					const courseHours = course.hours ?? 3.0; // Default to 3 if null

					await db.insert(studentCourses).values({
						mnumber: studentMnumber,
						term: term.toString(),
						year: year,
						part_of_term: faker.helpers.arrayElement(partOfTermList).code,
						crn: crn.toString(),
						course_subject: course.subject,
						course_number: course.number,
						course_suffix: course.suffix ?? "",
						course_section: section, // Use same section as instructorCourses
						course_hours: courseHours,
						course_level: "UG", // TODO: Make this dynamic based on studentPrograms.level
						registration_status: REGISTRATION_STATUS,
						instructional_method: faker.helpers.arrayElement(instructionalMethodList).code,
						last_attendance: (year < 2024 || (year === 2024 && term < 80)) ? faker.date.between({ from: new Date(year, term === 10 ? 0 : (term === 50 ? 4 : (term === 80 ? 7 : 10)), 1), to: new Date(year, term === 10 ? 4 : (term === 50 ? 7 : (term === 80 ? 11 : 11)), 28) }).toISOString().split('T')[0] : null,
						midterm_grade: (year < 2024 || (year === 2024 && term < 80)) ? faker.helpers.arrayElement(GRADES.filter(g => g !== 'W')) : null,
						final_grade: (year < 2024 || (year === 2024 && term < 80)) ? finalGrade : null,
					}).onConflictDoNothing();


					// --- Update Student Academic Info for this term ---
					// Only update if it's *after* the student's first term/year
					const studentInfo = studentDataMap.get(studentMnumber);
					if (studentInfo && (year > studentInfo.firstYear || (year === studentInfo.firstYear && term > studentInfo.firstTerm))) {
						// Get previous overall totals for this student
						const prevOverallHours = currentOverallHours.get(studentMnumber) ?? 0;
						const prevOverallPoints = currentOverallPoints.get(studentMnumber) ?? 0;

						// Generate metrics for THIS term, using previous overall as base
						const termMetrics = generateAcademicMetrics(prevOverallHours, prevOverallPoints);

						// Update the maps with the NEW overall totals
						currentOverallHours.set(studentMnumber, termMetrics.overall_attempted_hours);
						currentOverallPoints.set(studentMnumber, termMetrics.overall_quality_points);

						await db.insert(studentAcademicInfo).values({
							mnumber: studentMnumber,
							term: term.toString(),
							year: year,
							admit_term: studentInfo.firstTerm.toString(), // Admit term stays the same
							admit_year: studentInfo.firstYear,
							admit_code: faker.helpers.arrayElement(admitCodeList).code, // Could change, but keep simple for now
							academic_standing: faker.helpers.arrayElement(academicStandingList).code, // Update standing based on GPA maybe
							msu_attempted_hours: termMetrics.attempted_hours,
							msu_earned_hours: termMetrics.earned_hours,
							msu_quality_points: termMetrics.quality_points,
							msu_gpa: termMetrics.gpa,
							overall_attempted_hours: termMetrics.overall_attempted_hours,
							overall_earned_hours: termMetrics.overall_earned_hours,
							overall_quality_points: termMetrics.overall_quality_points,
							overall_gpa: termMetrics.overall_gpa,
						}).onConflictDoNothing(); // Handles the primary key constraint
					}
				}
			}
		}
	}

	console.log("Seeding complete.");
}

seed().catch((err) => {
	console.error("Seed error:", err);
	process.exit(1); // Exit with error code if seeding fails
});