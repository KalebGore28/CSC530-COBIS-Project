import { eq, and, or, like, count, SQL, inArray, desc, sql } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import {
	students,
	studentAcademicInfo,
	studentPrograms,
	departments,
	programs,
	colleges,
	studentAdvisors,
	academicStanding,
	terms,
	faculty,
	studentCourses,
	courses,
	registrationStatus,
	instructorCourses
} from '../db/schema';

/**
 * Service to handle student data operations
 */
export class StudentService {

	/**
	 * Get detailed information for a specific student
	 */
	static async getStudentInfo(mnumber: string) {
		const db = (await getDbConnection()).orm;

		// Get basic student information
		const studentInfo = await db
			.select({
				mnumber: students.mnumber,
				firstName: students.first_name,
				middleName: students.middle_name,
				lastName: students.last_name,
				suffix: students.suffix,
				gender: students.gender,
				birthdate: students.birthdate,
				email: students.email,
				cellPhone: students.cell_phone,
				age: students.age,
				race: students.race_description,
				citizenship: students.citizenship,
				residency: students.residency_description
			})
			.from(students)
			.where(eq(students.mnumber, mnumber))
			.limit(1);

		if (studentInfo.length === 0) {
			return null;
		}

		// Get academic information
		const academicInfo = await db
			.select({
				msuGpa: studentAcademicInfo.msu_gpa,
				overallGpa: studentAcademicInfo.overall_gpa,
				msuAttemptedHours: studentAcademicInfo.msu_attempted_hours,
				msuEarnedHours: studentAcademicInfo.msu_earned_hours,
				overallAttemptedHours: studentAcademicInfo.overall_attempted_hours,
				overallEarnedHours: studentAcademicInfo.overall_earned_hours,
				academicStanding: studentAcademicInfo.academic_standing,
				academicStandingDescription: academicStanding.description,
				admitTerm: studentAcademicInfo.admit_term,
				admitYear: studentAcademicInfo.admit_year,
				admitCode: studentAcademicInfo.admit_code
			})
			.from(studentAcademicInfo)
			.leftJoin(
				academicStanding,
				eq(studentAcademicInfo.academic_standing, academicStanding.code)
			)
			.where(eq(studentAcademicInfo.mnumber, mnumber))
			.limit(1);

		// Get admit term description
		let admitTermDescription = '';
		if (academicInfo.length > 0 && academicInfo[0].admitTerm) {
			const termInfo = await db
				.select({ description: terms.description })
				.from(terms)
				.where(eq(terms.code, academicInfo[0].admitTerm))
				.limit(1);

			admitTermDescription = termInfo[0]?.description || '';
		}

		// Get current programs (majors and minors)
		const programsData = await db
			.select({
				type: studentPrograms.type,
				level: studentPrograms.level,
				program: studentPrograms.program,
				programDescription: programs.description,
				department: departments.code,
				departmentDescription: departments.description,
				college: colleges.code,
				collegeDescription: colleges.description,
				term: studentPrograms.term,
				year: studentPrograms.year
			})
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.leftJoin(departments, eq(programs.department, departments.code))
			.leftJoin(colleges, eq(programs.college, colleges.code))
			.where(eq(studentPrograms.mnumber, mnumber))
			.orderBy(desc(studentPrograms.year), desc(studentPrograms.term), studentPrograms.type);

		// Group programs by type
		const majorPrograms = programsData.filter(p => p.type === 'MAJOR');
		const minorPrograms = programsData.filter(p => p.type === 'MINOR');

		// Get current advisors
		const currentAdvisors = await db
			.select({
				advisorMnumber: studentAdvisors.advisor_mnumber,
				term: studentAdvisors.term,
				year: studentAdvisors.year
			})
			.from(studentAdvisors)
			.where(eq(studentAdvisors.student_mnumber, mnumber))
			.orderBy(desc(studentAdvisors.year), desc(studentAdvisors.term));

		// Format the response
		return {
			studentInfo: studentInfo[0],
			academicInfo: academicInfo.length > 0 ? {
				...academicInfo[0],
				admitTermDescription
			} : null,
			programs: {
				majors: majorPrograms.map(p => ({
					code: p.program,
					description: p.programDescription,
					department: p.departmentDescription,
					college: p.collegeDescription,
					level: p.level,
					term: p.term,
					year: p.year
				})),
				minors: minorPrograms.map(p => ({
					code: p.program,
					description: p.programDescription,
					department: p.departmentDescription,
					college: p.collegeDescription,
					level: p.level,
					term: p.term,
					year: p.year
				}))
			},
			advisors: currentAdvisors.map(a => ({
				mnumber: a.advisorMnumber,
				term: a.term,
				year: a.year
			}))
		};
	}

	/**
	 * Check if a student is in a specific department
	 */
	static async isStudentInDepartment(mnumber: string, departmentCode: string): Promise<boolean> {
		const db = (await getDbConnection()).orm;

		// Query needs to join studentPrograms with programs to check department
		const result = await db
			.select({ count: count() })
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.where(
				and(
					eq(studentPrograms.mnumber, mnumber),
					eq(programs.department, departmentCode)
				)
			);

		return Number(result[0]?.count || 0) > 0;
	}

	/**
	 * Check if a student is advised by a specific instructor
	 */
	static async isAdvisee(studentMnumber: string, advisorMnumber: string): Promise<boolean> {
		const db = (await getDbConnection()).orm;

		const result = await db
			.select({ count: count() })
			.from(studentAdvisors)
			.where(
				and(
					eq(studentAdvisors.student_mnumber, studentMnumber),
					eq(studentAdvisors.advisor_mnumber, advisorMnumber)
				)
			);

		return Number(result[0]?.count || 0) > 0;
	}

	/**
	 * Get student programs (majors and minors)
	 */
	static async getStudentPrograms(mnumber: string) {
		const db = (await getDbConnection()).orm;

		// Check if student exists
		const studentExists = await db
			.select({ count: count() })
			.from(students)
			.where(eq(students.mnumber, mnumber));

		if (Number(studentExists[0]?.count || 0) === 0) {
			return null;
		}

		// Get all majors
		const majorsQuery = await db
			.select({
				code: programs.code,
				description: programs.description,
				department: departments.description,
				departmentCode: departments.code,
				college: colleges.description,
				collegeCode: colleges.code,
				level: studentPrograms.level,
				term: studentPrograms.term,
				year: studentPrograms.year
			})
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.innerJoin(departments, eq(programs.department, departments.code))
			.innerJoin(colleges, eq(departments.college, colleges.code))
			.where(
				and(
					eq(studentPrograms.mnumber, mnumber),
					eq(studentPrograms.type, 'MAJOR')
				)
			)
			.orderBy(desc(studentPrograms.year), desc(studentPrograms.term));

		// Get all minors
		const minorsQuery = await db
			.select({
				code: programs.code,
				description: programs.description,
				department: departments.description,
				departmentCode: departments.code,
				college: colleges.description,
				collegeCode: colleges.code,
				level: studentPrograms.level,
				term: studentPrograms.term,
				year: studentPrograms.year
			})
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.innerJoin(departments, eq(programs.department, departments.code))
			.innerJoin(colleges, eq(departments.college, colleges.code))
			.where(
				and(
					eq(studentPrograms.mnumber, mnumber),
					eq(studentPrograms.type, 'MINOR')
				)
			)
			.orderBy(desc(studentPrograms.year), desc(studentPrograms.term));

		return {
			majors: majorsQuery,
			minors: minorsQuery
		};
	}

	/**
	 * Get student academic information
	 */
	static async getStudentAcademicInfo(mnumber: string) {
		const db = (await getDbConnection()).orm;

		// Check if student exists
		const studentExists = await db
			.select({ count: count() })
			.from(students)
			.where(eq(students.mnumber, mnumber));

		if (Number(studentExists[0]?.count || 0) === 0) {
			return null;
		}

		// Get academic information
		const academicInfo = await db
			.select({
				msuGpa: studentAcademicInfo.msu_gpa,
				overallGpa: studentAcademicInfo.overall_gpa,
				msuAttemptedHours: studentAcademicInfo.msu_attempted_hours,
				msuEarnedHours: studentAcademicInfo.msu_earned_hours,
				overallAttemptedHours: studentAcademicInfo.overall_attempted_hours,
				overallEarnedHours: studentAcademicInfo.overall_earned_hours,
				academicStanding: studentAcademicInfo.academic_standing,
				academicStandingDescription: academicStanding.description,
				admitTerm: studentAcademicInfo.admit_term,
				admitYear: studentAcademicInfo.admit_year,
				admitCode: studentAcademicInfo.admit_code
			})
			.from(studentAcademicInfo)
			.leftJoin(
				academicStanding,
				eq(studentAcademicInfo.academic_standing, academicStanding.code)
			)
			.where(eq(studentAcademicInfo.mnumber, mnumber))
			.limit(1);

		if (academicInfo.length === 0) {
			return {
				exists: false,
				message: "Student has no academic record"
			};
		}

		// Get admit term description
		let admitTermDescription = '';
		if (academicInfo[0].admitTerm) {
			const termInfo = await db
				.select({ description: terms.description })
				.from(terms)
				.where(eq(terms.code, academicInfo[0].admitTerm))
				.limit(1);

			admitTermDescription = termInfo[0]?.description || '';
		}

		// Determine classification based on earned hours
		let classificationCode = "";
		let classificationDescription = "";

		const earnedHours = academicInfo[0].overallEarnedHours || 0;

		if (earnedHours < 30) {
			classificationCode = "FR";
			classificationDescription = "Freshman";
		} else if (earnedHours < 60) {
			classificationCode = "SO";
			classificationDescription = "Sophomore";
		} else if (earnedHours < 90) {
			classificationCode = "JR";
			classificationDescription = "Junior";
		} else {
			classificationCode = "SR";
			classificationDescription = "Senior";
		}

		// Format and return the academic information
		return {
			gpa: {
				overall: academicInfo[0].overallGpa,
				msu: academicInfo[0].msuGpa
			},
			credits: {
				overall: {
					attempted: academicInfo[0].overallAttemptedHours,
					earned: academicInfo[0].overallEarnedHours
				},
				msu: {
					attempted: academicInfo[0].msuAttemptedHours,
					earned: academicInfo[0].msuEarnedHours
				}
			},
			academicStanding: {
				code: academicInfo[0].academicStanding,
				description: academicInfo[0].academicStandingDescription
			},
			classification: {
				code: classificationCode,
				description: classificationDescription
			},
			admitInfo: {
				term: academicInfo[0].admitTerm,
				termDescription: admitTermDescription,
				year: academicInfo[0].admitYear,
				code: academicInfo[0].admitCode
			}
		};
	}

	/**
	 * Get student advisors with details
	 */
	static async getStudentAdvisors(mnumber: string) {
		const db = (await getDbConnection()).orm;

		// Check if student exists
		const studentExists = await db
			.select({ count: count() })
			.from(students)
			.where(eq(students.mnumber, mnumber));

		if (Number(studentExists[0]?.count || 0) === 0) {
			return null;
		}

		// Get advisors with their details
		const advisors = await db
			.select({
				mnumber: studentAdvisors.advisor_mnumber,
				firstName: faculty.first_name,
				lastName: faculty.last_name,
				email: sql<string>`faculty.mnumber || '@murraystate.edu'`,
				department: departments.description,
				office: sql<string | null>`null`,
				phone: sql<string | null>`null`,
				term: studentAdvisors.term,
				year: studentAdvisors.year,
				termDescription: terms.description
			})
			.from(studentAdvisors)
			.leftJoin(faculty, eq(studentAdvisors.advisor_mnumber, faculty.mnumber))
			.leftJoin(departments, eq(faculty.department, departments.code))
			.leftJoin(terms, eq(studentAdvisors.term, terms.code))
			.where(eq(studentAdvisors.student_mnumber, mnumber))
			.orderBy(desc(studentAdvisors.year), desc(studentAdvisors.term));

		return {
			mnumber,
			advisors: advisors.map(advisor => ({
				mnumber: advisor.mnumber,
				firstName: advisor.firstName || 'Unknown',
				lastName: advisor.lastName || 'Unknown',
				email: advisor.email || `${advisor.mnumber}@murraystate.edu`,
				department: advisor.department || 'Unknown',
				office: advisor.office,
				phone: advisor.phone,
				term: advisor.term,
				year: advisor.year,
				termDescription: advisor.termDescription || ''
			}))
		};
	}

	/**
	 * Get student's current enrollment status
	 */
	static async getStudentEnrollmentStatus(mnumber: string) {
		const db = (await getDbConnection()).orm;

		// Check if student exists
		const studentExists = await db
			.select({ count: count() })
			.from(students)
			.where(eq(students.mnumber, mnumber));

		if (Number(studentExists[0]?.count || 0) === 0) {
			return null;
		}

		// Find the current term and year by getting the maximum values from student_courses
		const currentTermInfo = await db
			.select({
				maxTerm: sql<string>`MAX(${studentCourses.term})`,
				maxYear: sql<number>`MAX(${studentCourses.year})`
			})
			.from(studentCourses);

		if (!currentTermInfo[0]?.maxTerm || !currentTermInfo[0]?.maxYear) {
			return {
				mnumber,
				enrollmentStatus: "Unknown",
				totalEnrolledCredits: 0,
				enrolledCourses: []
			};
		}

		const currentTerm = currentTermInfo[0].maxTerm;
		const currentYear = currentTermInfo[0].maxYear;

		// Get the term description
		const termInfo = await db
			.select({
				description: terms.description
			})
			.from(terms)
			.where(eq(terms.code, currentTerm))
			.limit(1);

		const termDescription = termInfo[0]?.description || '';

		// Get enrolled courses for the current term
		const enrolledCourses = await db
			.select({
				courseSubject: studentCourses.course_subject,
				courseNumber: studentCourses.course_number,
				courseSuffix: studentCourses.course_suffix,
				crn: studentCourses.crn,
				courseHours: studentCourses.course_hours,
				section: studentCourses.course_section,
				registrationStatus: registrationStatus.description,
				courseTitle: courses.title,
				instructorMnumber: instructorCourses.mnumber,
				instructorFirstName: faculty.first_name,
				instructorLastName: faculty.last_name
			})
			.from(studentCourses)
			.leftJoin(courses, and(
				eq(studentCourses.course_subject, courses.subject),
				eq(studentCourses.course_number, courses.number),
				eq(studentCourses.course_suffix, courses.suffix)
			))
			.leftJoin(registrationStatus, eq(studentCourses.registration_status, registrationStatus.code))
			.leftJoin(instructorCourses, and(
				eq(studentCourses.crn, instructorCourses.crn),
				eq(studentCourses.term, instructorCourses.term),
				eq(studentCourses.year, instructorCourses.year)
			))
			.leftJoin(faculty, eq(instructorCourses.mnumber, faculty.mnumber))
			.where(and(
				eq(studentCourses.mnumber, mnumber),
				eq(studentCourses.term, currentTerm),
				eq(studentCourses.year, currentYear)
			));

		// Calculate total enrolled credits
		const totalCredits = enrolledCourses.reduce((total, course) => total + course.courseHours, 0);

		// Format the enrolled courses
		const formattedCourses = enrolledCourses.map(course => {
			const instructorName = course.instructorFirstName && course.instructorLastName
				? `${course.instructorFirstName} ${course.instructorLastName}`
				: null;

			return {
				courseId: `${course.courseSubject} ${course.courseNumber}${course.courseSuffix}`,
				courseTitle: course.courseTitle,
				crn: course.crn,
				section: course.section,
				credits: course.courseHours,
				instructorName,
				registrationStatus: course.registrationStatus
			};
		});

		return {
			mnumber,
			currentTerm: {
				code: currentTerm,
				description: termDescription,
				year: currentYear
			},
			enrollmentStatus: formattedCourses.length > 0 ? "Enrolled" : "Not Enrolled",
			totalEnrolledCredits: totalCredits,
			enrolledCourses: formattedCourses
		};
	}
}