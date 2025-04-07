import { and, eq, exists, gte, inArray, lte, notExists, or, SQL } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import { studentAcademicInfo, studentCourses, studentPrograms, students } from '../db/schema';

/**
 * Interface for parsed course information
 */
interface ParsedCourse {
	subject: string;
	number: string;
	suffix: string;
}

/**
 * Interface for grade filter information
 */
interface GradeFilter extends ParsedCourse {
	grade: string;
}

/**
 * Interface for student lookup filter parameters
 */
interface StudentLookupFilters {
	academicLevels?: string[];
	gpaMin?: number;
	gpaMax?: number;
	majors?: string[];
	minors?: string[];
	coursesTaken?: ParsedCourse[];
	coursesNotTaken?: ParsedCourse[];
	gradeFilters?: GradeFilter[];
}

/**
 * Service class for handling student lookup operations
 */
export class StudentLookupService {
	/**
	 * Parse a course ID (e.g., "CSC530") into subject, number, and suffix components
	 */
	static parseCourseId(courseId: string): ParsedCourse {
		const match = courseId.match(/^([A-Z]+)(\d+)([A-Z]*)$/);
		if (!match) throw new Error(`Invalid course ID: ${courseId}`);
		return { subject: match[1], number: match[2], suffix: match[3] || '' };
	}

	/**
	 * Parse a grade filter (e.g., "CSC530:A") into course components and grade
	 */
	static parseGradeFilter(filter: string): GradeFilter {
		const [courseId, grade] = filter.split(':');
		const { subject, number, suffix } = this.parseCourseId(courseId);
		return { subject, number, suffix, grade };
	}

	/**
	 * Lookup students based on specified filters
	 */
	static async lookupStudents(filters: StudentLookupFilters) {
		const dbConnectionInstance = await getDbConnection();
		const db = dbConnectionInstance.orm;

		// Initialize base query
		let studentsQuery = db
			.select({
				mnumber: students.mnumber,
				firstName: students.first_name,
				lastName: students.last_name,
				email: students.email,
			})
			.from(students)
			.innerJoin(studentAcademicInfo, eq(students.mnumber, studentAcademicInfo.mnumber));

		// Build conditions
		let whereCondition: SQL<unknown> | undefined = undefined;
		const conditions: SQL<unknown>[] = [];

		// Academic level filter with OR condition for multiple levels
		if (filters.academicLevels && filters.academicLevels.length > 0) {
			const levelConditions: SQL<unknown>[] = [];

			filters.academicLevels.forEach(level => {
				if (level === 'Freshman') {
					levelConditions.push(lte(studentAcademicInfo.overall_earned_hours, 29) as SQL<unknown>);
				} else if (level === 'Sophomore') {
					levelConditions.push(and(
						gte(studentAcademicInfo.overall_earned_hours, 30),
						lte(studentAcademicInfo.overall_earned_hours, 59)
					) as SQL<unknown>);
				} else if (level === 'Junior') {
					levelConditions.push(and(
						gte(studentAcademicInfo.overall_earned_hours, 60),
						lte(studentAcademicInfo.overall_earned_hours, 89)
					) as SQL<unknown>);
				} else if (level === 'Senior') {
					levelConditions.push(gte(studentAcademicInfo.overall_earned_hours, 90) as SQL<unknown>);
				}
			});

			if (levelConditions.length > 0) {
				conditions.push(or(...levelConditions) as SQL<unknown>);
			}
		}

		// GPA range filter
		if (filters.gpaMin !== undefined && filters.gpaMax !== undefined) {
			conditions.push(
				and(
					gte(studentAcademicInfo.overall_gpa, filters.gpaMin),
					lte(studentAcademicInfo.overall_gpa, filters.gpaMax)
				) as SQL<unknown>
			);
		}

		// Majors filter
		if (filters.majors && filters.majors.length > 0) {
			conditions.push(
				exists(
					db
						.select()
						.from(studentPrograms)
						.where(
							and(
								eq(studentPrograms.mnumber, students.mnumber),
								eq(studentPrograms.type, 'MAJOR'),
								inArray(studentPrograms.program, filters.majors)
							) as SQL<unknown>
						)
				) as SQL<unknown>
			);
		}

		// Minors filter
		if (filters.minors && filters.minors.length > 0) {
			conditions.push(
				exists(
					db
						.select()
						.from(studentPrograms)
						.where(
							and(
								eq(studentPrograms.mnumber, students.mnumber),
								eq(studentPrograms.type, 'MINOR'),
								inArray(studentPrograms.program, filters.minors)
							) as SQL<unknown>
						)
				) as SQL<unknown>
			);
		}

		// Courses taken filter
		if (filters.coursesTaken && filters.coursesTaken.length > 0) {
			filters.coursesTaken.forEach(course => {
				conditions.push(
					exists(
						db
							.select()
							.from(studentCourses)
							.where(
								and(
									eq(studentCourses.mnumber, students.mnumber),
									eq(studentCourses.course_subject, course.subject),
									eq(studentCourses.course_number, course.number),
									eq(studentCourses.course_suffix, course.suffix)
								) as SQL<unknown>
							)
					) as SQL<unknown>
				);
			});
		}

		// Courses not taken filter
		if (filters.coursesNotTaken && filters.coursesNotTaken.length > 0) {
			filters.coursesNotTaken.forEach(course => {
				conditions.push(
					notExists(
						db
							.select()
							.from(studentCourses)
							.where(
								and(
									eq(studentCourses.mnumber, students.mnumber),
									eq(studentCourses.course_subject, course.subject),
									eq(studentCourses.course_number, course.number),
									eq(studentCourses.course_suffix, course.suffix)
								) as SQL<unknown>
							)
					) as SQL<unknown>
				);
			});
		}

		// Grade filters
		if (filters.gradeFilters && filters.gradeFilters.length > 0) {
			filters.gradeFilters.forEach(filter => {
				if (filter.grade) {
					conditions.push(
						exists(
							db
								.select()
								.from(studentCourses)
								.where(
									and(
										eq(studentCourses.mnumber, students.mnumber),
										eq(studentCourses.course_subject, filter.subject),
										eq(studentCourses.course_number, filter.number),
										eq(studentCourses.course_suffix, filter.suffix),
										eq(studentCourses.final_grade, filter.grade)
									) as SQL<unknown>
								)
						) as SQL<unknown>
					);
				}
			});
		}

		// Apply the where clause only if we have conditions
		if (conditions.length > 0) {
			whereCondition = and(...conditions) as SQL<unknown>;
			const updatedQuery = studentsQuery.where(whereCondition);
			return await updatedQuery;
		}

		// Execute query and return results
		return await studentsQuery;
	}
} 