import { eq, and, desc, sql, max, count, avg, sum, gte, lte, SQL, inArray } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import {
	instructors,
	user,
	instructorCourses,
	studentCourses,
	courses,
	departments,
	colleges,
	students,
	studentPrograms,
	studentAcademicInfo
} from '../db/schema';

/**
 * Service to handle instructor data operations
 */
export class InstructorsService {
	// Map term code to name
	private static termNameMap: Record<string, string> = {
		'10': 'SPRING',
		'50': 'SUMMER',
		'80': 'FALL',
		'90': 'WINTER',
		'9999': 'UNKNOWN'
	};

	/**
	 * Get basic instructor information
	 */
	static async getBasicInfo(mnumber: string) {
		const db = (await getDbConnection()).orm;

		const instructorInfo = await db
			.select({
				mnumber: instructors.mnumber,
				firstName: instructors.first_name,
				lastName: instructors.last_name,
				department: departments.description,
				college: colleges.description,
				email: user.email,
				image: user.image
			})
			.from(instructors)
			.leftJoin(user, eq(instructors.mnumber, user.mnumber))
			.leftJoin(departments, eq(instructors.department, departments.code))
			.leftJoin(colleges, eq(instructors.college, colleges.code))
			.where(eq(instructors.mnumber, mnumber))
			.limit(1);

		if (instructorInfo.length === 0) {
			return null;
		}

		const instructor = instructorInfo[0];

		return {
			mnumber: instructor.mnumber,
			name: `${instructor.firstName} ${instructor.lastName}`,
			firstName: instructor.firstName,
			lastName: instructor.lastName,
			department: instructor.department,
			college: instructor.college,
			email: instructor.email,
			image: instructor.image
		};
	}

	/**
	 * Get current term information
	 */
	static async getCurrentTermInfo() {
		const db = (await getDbConnection()).orm;

		// Find the current term and year
		const currentTermData = await db
			.select({
				maxYear: max(instructorCourses.year),
			})
			.from(instructorCourses);

		const maxYear = currentTermData[0]?.maxYear || new Date().getFullYear();

		const currentTermCodeData = await db
			.select({
				maxTerm: max(instructorCourses.term),
			})
			.from(instructorCourses)
			.where(eq(instructorCourses.year, maxYear));

		const currentTermCode = currentTermCodeData[0]?.maxTerm || '9999';

		return { currentTermCode, maxYear };
	}

	/**
	 * Check if instructor exists
	 */
	static async instructorExists(mnumber: string) {
		const db = (await getDbConnection()).orm;

		const result = await db
			.select({ count: count() })
			.from(instructors)
			.where(eq(instructors.mnumber, mnumber));

		return result[0]?.count > 0;
	}

	/**
	 * Get instructor's department
	 */
	static async getInstructorDepartment(mnumber: string) {
		const db = (await getDbConnection()).orm;

		const result = await db
			.select({ department: instructors.department })
			.from(instructors)
			.where(eq(instructors.mnumber, mnumber))
			.limit(1);

		return result.length > 0 ? result[0].department : null;
	}

	/**
	 * Get current teaching status
	 */
	static async getCurrentStatus(mnumber: string) {
		const db = (await getDbConnection()).orm;

		const { currentTermCode, maxYear } = await this.getCurrentTermInfo();

		// Check if currently teaching
		const currentCourseCount = await db
			.select({
				count: count()
			})
			.from(instructorCourses)
			.where(
				and(
					eq(instructorCourses.mnumber, mnumber),
					eq(instructorCourses.term, currentTermCode),
					eq(instructorCourses.year, maxYear)
				)
			);

		const isCurrentlyTeaching = currentCourseCount[0]?.count > 0;
		const currentTerm = this.termNameMap[currentTermCode] || 'UNKNOWN';

		return {
			currentTerm: `${currentTerm} ${maxYear}`,
			currentTermCode,
			currentYear: maxYear,
			isCurrentlyTeaching,
			currentCourseCount: currentCourseCount[0]?.count || 0
		};
	}

	/**
	 * Get teaching summary
	 */
	static async getTeachingSummary(mnumber: string) {
		const db = (await getDbConnection()).orm;

		// Calculate teaching summary
		const totalCoursesTaught = await db
			.select({
				count: count()
			})
			.from(instructorCourses)
			.where(eq(instructorCourses.mnumber, mnumber));

		// Get unique courses taught count
		const uniqueCoursesTaught = await db
			.select({
				count: sql`COUNT(DISTINCT ${instructorCourses.course_subject} || ${instructorCourses.course_number} || ${instructorCourses.course_suffix})`
			})
			.from(instructorCourses)
			.where(eq(instructorCourses.mnumber, mnumber));

		// Get most taught courses
		const mostTaughtCoursesRaw = await db
			.select({
				courseSubject: instructorCourses.course_subject,
				courseNumber: instructorCourses.course_number,
				courseSuffix: instructorCourses.course_suffix,
				courseTitle: courses.title,
				count: count(),
			})
			.from(instructorCourses)
			.leftJoin(
				courses,
				and(
					eq(instructorCourses.course_subject, courses.subject),
					eq(instructorCourses.course_number, courses.number),
					eq(instructorCourses.course_suffix, courses.suffix)
				)
			)
			.where(eq(instructorCourses.mnumber, mnumber))
			.groupBy(
				instructorCourses.course_subject,
				instructorCourses.course_number,
				instructorCourses.course_suffix,
				courses.title
			)
			.orderBy(desc(count()))
			.limit(5);

		const mostTaughtCourses = mostTaughtCoursesRaw.map(course => ({
			courseId: `${course.courseSubject}${course.courseNumber}${course.courseSuffix}`,
			courseTitle: course.courseTitle || 'UNKNOWN',
			timesTaught: course.count
		}));

		// Get student metrics
		const studentMetrics = await db
			.select({
				totalStudents: count(studentCourses.mnumber),
				totalCreditHours: sum(studentCourses.course_hours)
			})
			.from(instructorCourses)
			.innerJoin(
				studentCourses,
				and(
					eq(instructorCourses.crn, studentCourses.crn),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(eq(instructorCourses.mnumber, mnumber));

		// Calculate average class size
		const classesWithSizes = await db
			.select({
				crn: instructorCourses.crn,
				term: instructorCourses.term,
				year: instructorCourses.year,
				studentCount: count(studentCourses.mnumber)
			})
			.from(instructorCourses)
			.innerJoin(
				studentCourses,
				and(
					eq(instructorCourses.crn, studentCourses.crn),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(eq(instructorCourses.mnumber, mnumber))
			.groupBy(instructorCourses.crn, instructorCourses.term, instructorCourses.year);

		const avgClassSize = classesWithSizes.length > 0
			? classesWithSizes.reduce((sum, cls) => sum + cls.studentCount, 0) / classesWithSizes.length
			: 0;

		return {
			totalCoursesTaught: totalCoursesTaught[0]?.count || 0,
			uniqueCoursesTaught: uniqueCoursesTaught[0]?.count || 0,
			totalStudentsTaught: studentMetrics[0]?.totalStudents || 0,
			totalCreditHoursDelivered: Number(studentMetrics[0]?.totalCreditHours || 0),
			averageClassSize: Math.round(avgClassSize * 10) / 10,
			mostTaughtCourses
		};
	}

	/**
	 * Get course details
	 */
	static async getCourseDetails(mnumber: string) {
		const db = (await getDbConnection()).orm;

		const courseDetailsQuery = await db
			.select({
				term: instructorCourses.term,
				year: instructorCourses.year,
				courseSubject: instructorCourses.course_subject,
				courseNumber: instructorCourses.course_number,
				courseSuffix: instructorCourses.course_suffix,
				courseTitle: courses.title,
				crn: instructorCourses.crn,
				creditHours: studentCourses.course_hours,
				studentCount: count(studentCourses.mnumber),
			})
			.from(instructorCourses)
			.leftJoin(
				courses,
				and(
					eq(instructorCourses.course_subject, courses.subject),
					eq(instructorCourses.course_number, courses.number),
					eq(instructorCourses.course_suffix, courses.suffix)
				)
			)
			.leftJoin(
				studentCourses,
				and(
					eq(instructorCourses.crn, studentCourses.crn),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(eq(instructorCourses.mnumber, mnumber))
			.groupBy(
				instructorCourses.term,
				instructorCourses.year,
				instructorCourses.course_subject,
				instructorCourses.course_number,
				instructorCourses.course_suffix,
				courses.title,
				instructorCourses.crn,
				studentCourses.course_hours
			)
			.orderBy(desc(instructorCourses.year), desc(instructorCourses.term));

		return courseDetailsQuery.map(course => {
			const termName = this.termNameMap[course.term] || 'UNKNOWN';
			return {
				term: termName,
				termCode: course.term,
				year: course.year,
				courseId: `${course.courseSubject}${course.courseNumber}${course.courseSuffix}`,
				courseTitle: course.courseTitle || 'UNKNOWN',
				courseSubject: course.courseSubject,
				courseNumber: course.courseNumber,
				courseSuffix: course.courseSuffix,
				crn: course.crn,
				creditHours: course.creditHours || 0,
				studentCount: course.studentCount || 0,
				totalCreditHours: (course.creditHours || 0) * (course.studentCount || 0)
			};
		});
	}

	/**
	 * Get term summaries
	 */
	static async getTermSummaries(mnumber: string) {
		const db = (await getDbConnection()).orm;

		const termSummariesRaw = await db
			.select({
				term: instructorCourses.term,
				year: instructorCourses.year,
				courseCount: sql`COUNT(DISTINCT ${instructorCourses.crn})`,
				studentCount: count(studentCourses.mnumber),
				creditHoursDelivered: sum(studentCourses.course_hours)
			})
			.from(instructorCourses)
			.leftJoin(
				studentCourses,
				and(
					eq(instructorCourses.crn, studentCourses.crn),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(eq(instructorCourses.mnumber, mnumber))
			.groupBy(instructorCourses.term, instructorCourses.year)
			.orderBy(desc(instructorCourses.year), desc(instructorCourses.term));

		return termSummariesRaw.map(term => ({
			term: this.termNameMap[term.term] || 'UNKNOWN',
			termCode: term.term,
			year: term.year,
			courseCount: term.courseCount,
			studentCount: term.studentCount || 0,
			creditHoursDelivered: Number(term.creditHoursDelivered || 0)
		}));
	}

	/**
	 * Get credit hours data for an instructor
	 * Filters data by term and/or year if provided
	 */
	static async getCreditHoursData(
		mnumber: string,
		termCode?: string,
		year?: number,
		startYear?: number,
		endYear?: number
	) {
		const db = (await getDbConnection()).orm;

		// Base query conditions - explicitly type the array
		const conditions: SQL<unknown>[] = [eq(instructorCourses.mnumber, mnumber)];

		// Add filters if provided
		if (termCode) {
			conditions.push(eq(instructorCourses.term, termCode));
		}

		if (year !== undefined) {
			conditions.push(eq(instructorCourses.year, year));
		} else if (startYear !== undefined && endYear !== undefined) {
			// Create year range condition without directly pushing to conditions
			const yearRangeCondition = and(
				gte(instructorCourses.year, startYear),
				lte(instructorCourses.year, endYear)
			);
			if (yearRangeCondition !== undefined) {
				conditions.push(yearRangeCondition);
			}
		}

		// Get detailed course credit hour data
		const courseDetailQuery = await db
			.select({
				term: instructorCourses.term,
				year: instructorCourses.year,
				crn: instructorCourses.crn,
				courseSubject: instructorCourses.course_subject,
				courseNumber: instructorCourses.course_number,
				courseSuffix: instructorCourses.course_suffix,
				courseTitle: courses.title,
				creditHours: studentCourses.course_hours,
				studentCount: count(), // Fixed: removed parameter
			})
			.from(instructorCourses)
			.leftJoin(
				courses,
				and(
					eq(instructorCourses.course_subject, courses.subject),
					eq(instructorCourses.course_number, courses.number),
					eq(instructorCourses.course_suffix, courses.suffix)
				)
			)
			.leftJoin(
				studentCourses,
				and(
					eq(instructorCourses.crn, studentCourses.crn),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(and(...conditions))
			.groupBy(
				instructorCourses.term,
				instructorCourses.year,
				instructorCourses.crn,
				instructorCourses.course_subject,
				instructorCourses.course_number,
				instructorCourses.course_suffix,
				courses.title,
				studentCourses.course_hours
			)
			.orderBy(desc(instructorCourses.year), desc(instructorCourses.term));

		// Get term summaries
		const termSummaryQuery = await db
			.select({
				term: instructorCourses.term,
				year: instructorCourses.year,
				courseCount: sql`COUNT(DISTINCT ${instructorCourses.crn})`,
				totalStudents: count(), // Fixed: removed parameter
				totalCreditHours: sum(studentCourses.course_hours) // Fixed: simplified calculation
			})
			.from(instructorCourses)
			.leftJoin(
				studentCourses,
				and(
					eq(instructorCourses.crn, studentCourses.crn),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(and(...conditions))
			.groupBy(instructorCourses.term, instructorCourses.year)
			.orderBy(desc(instructorCourses.year), desc(instructorCourses.term));

		// Transform course details for response
		const courseDetails = courseDetailQuery.map(course => {
			const termName = this.termNameMap[course.term] || 'UNKNOWN';
			const totalCreditHours = (course.creditHours || 0) * (course.studentCount || 0);

			return {
				term: termName,
				termCode: course.term,
				year: course.year,
				crn: course.crn,
				courseId: `${course.courseSubject}${course.courseNumber}${course.courseSuffix}`,
				courseTitle: course.courseTitle || 'UNKNOWN',
				creditHours: course.creditHours || 0,
				studentCount: course.studentCount || 0,
				totalCreditHours: totalCreditHours
			};
		});

		// Transform term summaries for response
		const termSummaries = termSummaryQuery.map(term => ({
			term: this.termNameMap[term.term] || 'UNKNOWN',
			termCode: term.term,
			year: term.year,
			courseCount: term.courseCount || 0,
			totalStudents: term.totalStudents || 0,
			totalCreditHours: Number(term.totalCreditHours || 0)
		}));

		// Calculate overall statistics
		const overallStats = {
			totalCoursesTaught: courseDetails.length,
			totalCreditHoursGenerated: termSummaries.reduce((sum, term) => sum + term.totalCreditHours, 0),
			averageCreditHoursPerTerm: termSummaries.length > 0
				? Math.round((termSummaries.reduce((sum, term) => sum + term.totalCreditHours, 0) / termSummaries.length) * 10) / 10
				: 0,
			maxCreditHoursInTerm: termSummaries.length > 0
				? Math.max(...termSummaries.map(term => term.totalCreditHours))
				: 0
		};

		// Prepare most credit-generating courses
		const courseCreditMap = new Map();
		courseDetails.forEach(course => {
			const key = `${course.courseId}: ${course.courseTitle}`;
			const current = courseCreditMap.get(key) || 0;
			courseCreditMap.set(key, current + course.totalCreditHours);
		});

		const topCreditGeneratingCourses = Array.from(courseCreditMap.entries())
			.map(([course, credits]) => ({ course, creditHours: credits }))
			.sort((a, b) => b.creditHours - a.creditHours)
			.slice(0, 5);

		return {
			overallStats,
			termSummaries,
			courseDetails,
			topCreditGeneratingCourses
		};
	}


	/**
	 * Get class roster for a specific course taught by an instructor
	 */
	static async getClassRoster(
		mnumber: string,
		courseSubject: string,
		courseNumber: string,
		courseSuffix: string,
		termCode: string,
		year: number
	) {
		const db = (await getDbConnection()).orm;

		// First verify that the instructor taught this course
		const taughtCourse = await db
			.select({ count: count() })
			.from(instructorCourses)
			.where(
				and(
					eq(instructorCourses.mnumber, mnumber),
					eq(instructorCourses.course_subject, courseSubject),
					eq(instructorCourses.course_number, courseNumber),
					eq(instructorCourses.course_suffix, courseSuffix),
					eq(instructorCourses.term, termCode),
					eq(instructorCourses.year, year)
				)
			);

		if (!taughtCourse[0] || taughtCourse[0].count === 0) {
			return null; // Instructor did not teach this course
		}

		// Get course details
		const courseDetails = await db
			.select({
				courseSubject: instructorCourses.course_subject,
				courseNumber: instructorCourses.course_number,
				courseSuffix: instructorCourses.course_suffix,
				courseTitle: courses.title,
				crn: instructorCourses.crn,
				creditHours: studentCourses.course_hours
			})
			.from(instructorCourses)
			.leftJoin(studentCourses,
				and(
					eq(instructorCourses.course_subject, studentCourses.course_subject),
					eq(instructorCourses.course_number, studentCourses.course_number),
					eq(instructorCourses.course_suffix, studentCourses.course_suffix),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.leftJoin(
				courses,
				and(
					eq(instructorCourses.course_subject, courses.subject),
					eq(instructorCourses.course_number, courses.number),
					eq(instructorCourses.course_suffix, courses.suffix)
				)
			)
			.where(
				and(
					eq(instructorCourses.mnumber, mnumber),
					eq(instructorCourses.course_subject, courseSubject),
					eq(instructorCourses.course_number, courseNumber),
					eq(instructorCourses.course_suffix, courseSuffix),
					eq(instructorCourses.term, termCode),
					eq(instructorCourses.year, year)
				)
			)
			.limit(1);

		if (courseDetails.length === 0) {
			return null; // Course not found
		}

		// Get student information including academic details
		const studentsRaw = await db
			.select({
				// Student base info
				mnumber: studentCourses.mnumber,
				firstName: students.first_name,
				middleName: students.middle_name,
				lastName: students.last_name,
				suffix: students.suffix,
				email: students.email,

				// Course-specific info
				creditHours: studentCourses.course_hours,
				finalGrade: studentCourses.final_grade,
				midtermGrade: studentCourses.midterm_grade,
				registrationStatus: studentCourses.registration_status,
				lastAttendance: studentCourses.last_attendance,

				// Academic info
				overallGpa: studentAcademicInfo.overall_gpa,
				earnedHours: studentAcademicInfo.overall_earned_hours
			})
			.from(studentCourses)
			.leftJoin(students, eq(studentCourses.mnumber, students.mnumber))
			.leftJoin(studentAcademicInfo, eq(studentCourses.mnumber, studentAcademicInfo.mnumber))
			.where(
				and(
					eq(studentCourses.course_subject, courseSubject),
					eq(studentCourses.course_number, courseNumber),
					eq(studentCourses.course_suffix, courseSuffix),
					eq(studentCourses.term, termCode),
					eq(studentCourses.year, year)
				)
			)
			.orderBy(students.last_name, students.first_name);

		// Rest of the method remains the same...
		// Get student majors (separate query since we need to handle multiple programs per student)
		const studentIds = studentsRaw.map(student => student.mnumber);

		// Get the latest major for each student
		const studentMajorsRaw = await db
			.select({
				mnumber: studentPrograms.mnumber,
				program: studentPrograms.program,
				department: departments.description,
				college: colleges.description,
				term: studentPrograms.term,
				year: studentPrograms.year
			})
			.from(studentPrograms)
			.leftJoin(departments, eq(studentPrograms.department, departments.code))
			.leftJoin(colleges, eq(studentPrograms.college, colleges.code))
			.where(
				and(
					inArray(studentPrograms.mnumber, studentIds),
					eq(studentPrograms.type, 'MAJOR')
				)
			)
			.orderBy(desc(studentPrograms.year), desc(studentPrograms.term));

		// Create a map of student majors (using only the most recent major for each student)
		const studentMajorMap = new Map();
		studentMajorsRaw.forEach(majorInfo => {
			if (!studentMajorMap.has(majorInfo.mnumber)) {
				studentMajorMap.set(majorInfo.mnumber, {
					major: majorInfo.program,
					department: majorInfo.department,
					college: majorInfo.college
				});
			}
		});

		// Process student list with majors
		const studentList = studentsRaw.map(student => {
			const majorInfo = studentMajorMap.get(student.mnumber) || {
				major: 'Undeclared',
				department: 'Undeclared',
				college: 'Undeclared'
			};

			// Format name with suffix if present
			const formattedName = student.suffix
				? `${student.firstName} ${student.lastName}, ${student.suffix}`
				: `${student.firstName} ${student.lastName}`;

			return {
				mnumber: student.mnumber,
				name: formattedName,
				firstName: student.firstName,
				middleName: student.middleName,
				lastName: student.lastName,
				suffix: student.suffix,
				email: student.email,
				major: majorInfo.major,
				department: majorInfo.department,
				college: majorInfo.college,
				creditHours: student.creditHours || 0,
				finalGrade: student.finalGrade || 'N/A',
				midtermGrade: student.midtermGrade || 'N/A',
				registrationStatus: student.registrationStatus,
				lastAttendance: student.lastAttendance,
				overallGpa: student.overallGpa || 0,
				earnedHours: student.earnedHours || 0
			};
		});

		// Calculate class statistics
		// Grade to GPA conversion
		const gradeToGpa = {
			'A': 4.0, 'A-': 3.7,
			'B+': 3.3, 'B': 3.0, 'B-': 2.7,
			'C+': 2.3, 'C': 2.0, 'C-': 1.7,
			'D+': 1.3, 'D': 1.0, 'D-': 0.7,
			'F': 0.0
		};

		// Filter out non-graded students for GPA calculation
		const gradedStudents = studentList.filter(
			student => student.finalGrade && student.finalGrade in gradeToGpa
		);

		const totalStudents = studentList.length;
		const totalGraded = gradedStudents.length;

		// Calculate overall GPA
		const totalGpaPoints = gradedStudents.reduce((sum, student) => {
			const gpa = gradeToGpa[student.finalGrade as keyof typeof gradeToGpa] || 0;
			return sum + gpa;
		}, 0);

		const overallGpa = totalGraded > 0
			? Math.round((totalGpaPoints / totalGraded) * 100) / 100
			: 0;

		// Calculate grade distribution
		const gradeDistribution: Record<string, number> = {};
		gradedStudents.forEach(student => {
			const grade = student.finalGrade;
			gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
		});

		// Format course ID
		const courseId = `${courseSubject}${courseNumber}${courseSuffix || ''}`;

		// Determine term name
		const termName = this.termNameMap[termCode] || 'UNKNOWN';

		// Format the final response
		return {
			course: {
				courseId,
				courseSubject,
				courseNumber,
				courseSuffix,
				courseTitle: courseDetails[0].courseTitle || 'UNKNOWN',
				termCode,
				termName,
				year,
				creditHours: courseDetails[0].creditHours || 0,
				fullTerm: `${termName} ${year}`
			},
			roster: studentList,
			stats: {
				totalStudents,
				totalGraded,
				overallGpa,
				gradeDistribution
			}
		};
	}


}
