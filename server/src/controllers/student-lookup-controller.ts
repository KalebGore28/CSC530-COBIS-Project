import { Request, Response } from 'express';
import { StudentLookupService } from '../services/student-lookup-service';

/**
 * Controller for student lookup operations
 */
export class StudentLookupController {
	/**
	 * Get students based on various academic criteria
	 */
	static async lookupStudents(req: Request, res: Response) {
		try {
			// Extract and validate query parameters
			const { academicLevels, gpaMin, gpaMax, majors, minors, coursesTaken, coursesNotTaken, gradeFilters } = req.query;

			// Parse query parameters into usable formats
			const academicLevelsArray = typeof academicLevels === 'string' ? academicLevels.split(',') : [];
			const gpaMinNum = typeof gpaMin === 'string' ? parseFloat(gpaMin) : undefined;
			const gpaMaxNum = typeof gpaMax === 'string' ? parseFloat(gpaMax) : undefined;
			const majorsArray = typeof majors === 'string' ? majors.split(',') : [];
			const minorsArray = typeof minors === 'string' ? minors.split(',') : [];
			const coursesTakenArray = typeof coursesTaken === 'string' ? coursesTaken.split(',') : [];
			const coursesNotTakenArray = typeof coursesNotTaken === 'string' ? coursesNotTaken.split(',') : [];
			const gradeFiltersArray = typeof gradeFilters === 'string' ? gradeFilters.split(',') : [];

			// Parse course IDs and grade filters
			const parsedCoursesTaken = coursesTakenArray.map(courseId =>
				StudentLookupService.parseCourseId(courseId)
			);

			const parsedCoursesNotTaken = coursesNotTakenArray.map(courseId =>
				StudentLookupService.parseCourseId(courseId)
			);

			const parsedGradeFilters = gradeFiltersArray.map(filter =>
				StudentLookupService.parseGradeFilter(filter)
			);

			// Prepare filters object
			const filters = {
				academicLevels: academicLevelsArray,
				gpaMin: gpaMinNum,
				gpaMax: gpaMaxNum,
				majors: majorsArray,
				minors: minorsArray,
				coursesTaken: parsedCoursesTaken,
				coursesNotTaken: parsedCoursesNotTaken,
				gradeFilters: parsedGradeFilters
			};

			// Call service to look up students
			const students = await StudentLookupService.lookupStudents(filters);

			// Return the results
			res.json(students);
		} catch (error) {
			console.error('Error in student lookup:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}
} 