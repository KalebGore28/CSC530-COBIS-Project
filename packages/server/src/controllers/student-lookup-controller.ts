import { Request, Response } from 'express';
import { StudentLookupService } from '../services/student-lookup-service';
import { z } from 'zod';
import 'zod-openapi/extend';

// --- Validation Schemas ---
export const studentLookupQuerySchema = z.object({
	academicLevels: z
		.preprocess((val) => {
			// coerce "Freshman, Sophomore" → ["Freshman", "Sophomore"]
			if (typeof val === 'string' && val.trim() !== '') return val.split(',').map((s) => s.trim());
			if (Array.isArray(val)) return val.map((s) => s.trim());
			return undefined;
		}, z
			.array(z.enum(['Freshman', 'Sophomore', 'Junior', 'Senior']))
			.optional()
			.openapi({ description: 'Academic levels (e.g. Freshman, Sophomore)' })
		),
	gpaMin: z
		.preprocess((val) => {
			// coerce "3.5" → 3.5
			if (typeof val === 'string' && val.trim() !== '') return parseFloat(val);
			if (typeof val === 'number') return val;
			return undefined;
		}, z
			.number()
			.min(0)
			.max(4)
			.optional()
			.openapi({ description: 'Minimum GPA (0.0 - 4.0)' })
		),
	gpaMax: z
		.preprocess((val) => {
			// coerce "3.5" → 3.5
			if (typeof val === 'string' && val.trim() !== '') return parseFloat(val);
			if (typeof val === 'number') return val;
			return undefined;
		}, z
			.number()
			.min(0)
			.max(4)
			.optional()
			.openapi({ description: 'Maximum GPA (0.0 - 4.0)' })
		),
	majors: z
		.preprocess((val) => {
			// coerce "CS, Math" → ["CS", "Math"]
			if (typeof val === 'string' && val.trim() !== '') return val.split(',').map((s) => s.trim());
			if (Array.isArray(val)) return val.map((s) => s.trim());
			return undefined;
		}, z
			.array(z.string())
			.optional()
			.openapi({ description: 'Majors (e.g. CS, Math)' })
		),
	minors: z
		.preprocess((val) => {
			// coerce "CS, Math" → ["CS", "Math"]
			if (typeof val === 'string' && val.trim() !== '') return val.split(',').map((s) => s.trim());
			if (Array.isArray(val)) return val.map((s) => s.trim());
			return undefined;
		}, z
			.array(z.string())
			.optional()
			.openapi({ description: 'Minors (e.g. CS, Math)' })
		),
	coursesTaken: z
		.preprocess((val) => {
			// coerce "CS101, MATH101" → ["CS101", "MATH101"]
			if (typeof val === 'string' && val.trim() !== '') return val.split(',').map((s) => s.trim());
			if (Array.isArray(val)) return val.map((s) => s.trim());
			return undefined;
		}, z
			.array(z.string())
			.optional()
			.openapi({ description: 'Courses taken (e.g. CS101, MATH101)' })
		),
	coursesNotTaken: z
		.preprocess((val) => {
			// coerce "CS101, MATH101" → ["CS101", "MATH101"]
			if (typeof val === 'string' && val.trim() !== '') return val.split(',').map((s) => s.trim());
			if (Array.isArray(val)) return val.map((s) => s.trim());
			return undefined;
		}, z
			.array(z.string())
			.optional()
			.openapi({ description: 'Courses not taken (e.g. CS101, MATH101)' })
		),
	gradeFilters: z
		.preprocess((val) => {
			// coerce "A, B" → ["A", "B"]
			if (typeof val === 'string' && val.trim() !== '') return val.split(',').map((s) => s.trim());
			if (Array.isArray(val)) return val.map((s) => s.trim());
			return undefined;
		}, z
			.array(z.enum(['A', 'B', 'C', 'D', 'F']))
			.optional()
			.openapi({ description: 'Grade filters (e.g. A, B)' })
		)
})

/**
 * Controller for student lookup operations
 */
export class StudentLookupController {
	/**
	 * Get students based on various academic criteria
	 */
	static async lookupStudents(req: Request, res: Response) {
		// Validate query parameters using Zod schema
		const validationResult = studentLookupQuerySchema.safeParse(req.query);
		if (!validationResult.success) {
			// If validation fails, return a 400 Bad Request response
			res.status(400).json({
				error: 'Invalid query parameters',
				details: validationResult.error.errors
			});
			return;
		}
		// If validation succeeds, extract the validated data
		const { academicLevels, gpaMin, gpaMax, majors, minors, coursesTaken, coursesNotTaken, gradeFilters } = validationResult.data;

		try {
			// Parse course IDs and grade filters
			const parsedCoursesTaken = coursesTaken?.map(courseId =>
				StudentLookupService.parseCourseId(courseId)
			);

			const parsedCoursesNotTaken = coursesNotTaken?.map(courseId =>
				StudentLookupService.parseCourseId(courseId)
			);

			const parsedGradeFilters = gradeFilters?.map(filter =>
				StudentLookupService.parseGradeFilter(filter)
			);

			// Prepare filters object
			const filters = {
				academicLevels,
				gpaMin,
				gpaMax,
				majors,
				minors,
				coursesTaken: parsedCoursesTaken,
				coursesNotTaken: parsedCoursesNotTaken,
				gradeFilters: parsedGradeFilters
			};

			// Call service to look up students
			const students = await StudentLookupService.lookupStudents(filters);

			// Return the results
			res.json(students);
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
		}
	}
} 