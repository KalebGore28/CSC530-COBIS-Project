import { eq, and, desc, sql, max, count, sum } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import {
	instructors,
	user,
	instructorCourses,
	studentCourses,
	courses,
	departments,
	colleges
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
}