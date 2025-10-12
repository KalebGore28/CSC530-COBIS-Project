import type { Course } from '../../db/schema';
import { ApolloContext } from '../../app';

export const CourseResolver = {
	student_courses: (
		course: Course,
		args: { startTerm: string; startYear: number; endTerm: string; endYear: number },
		{ loaders }: ApolloContext
	) => {
		const { startTerm, startYear, endTerm, endYear } = args;


		const loader = loaders.getStudentCoursesLoader(
			startTerm,
			startYear,
			endTerm,
			endYear
		);

		return loader.load([
			course.subject,
			course.number,
			course.suffix
		].join('|'));
	}
}