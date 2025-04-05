import { and, eq, exists, gte, inArray, lte, notExists, or } from 'drizzle-orm';
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

		// Build single whereClause by accumulating conditions
		const conditions = [];

		// Academic level filter with OR condition for multiple levels
		if (filters.academicLevels && filters.academicLevels.length > 0) {
			const levelConditions = filters.academicLevels.map(level => {
				if (level === 'Freshman') {
					return lte(studentAcademicInfo.overall_earned_hours, 29);
				} else if (level === 'Sophomore') {
					return and(gte(studentAcademicInfo.overall_earned_hours, 30), lte(studentAcademicInfo.overall_earned_hours, 59));
				} else if (level === 'Junior') {
					return and(gte(studentAcademicInfo.overall_earned_hours, 60), lte(studentAcademicInfo.overall_earned_hours, 89));
				} else if (level === 'Senior') {
					return gte(studentAcademicInfo.overall_earned_hours, 90);
				}
				return null;
			}).filter(Boolean);

			if (levelConditions.length > 0) {
				conditions.push(or(...levelConditions));
			}
		}

		// GPA range filter
		if (filters.gpaMin !== undefined && filters.gpaMax !== undefined) {
			conditions.push(
				and(
					gte(studentAcademicInfo.overall_gpa, filters.gpaMin),
					lte(studentAcademicInfo.overall_gpa, filters.gpaMax)
				)
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
							)
						)
				)
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
							)
						)
				)
			);
		}

		// Courses taken filter
		if (filters.coursesTaken) {
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
								)
							)
					)
				);
			});
		}

		// Courses not taken filter
		if (filters.coursesNotTaken) {
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
								)
							)
					)
				);
			});
		}

		// Grade filters
		if (filters.gradeFilters) {
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
									)
								)
						)
					);
				}
			});
		}

		// Apply the single whereClause
		if (conditions.length > 0) {
			studentsQuery = studentsQuery.where(and(...conditions));
		}

		// Execute query and return results
		return await studentsQuery;
	}
} 