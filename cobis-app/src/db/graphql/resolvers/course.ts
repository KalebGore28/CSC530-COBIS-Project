import { courses } from '../../schema';
import type { ApolloContext } from '@/middleware/apollo-server-context';

type Course = typeof courses.$inferSelect;

export const CourseResolver = {
	student_courses: (
		course: Course,
		args: { startTerm: string; startYear: number; endTerm: string; endYear: number },
		{ loaders }: ApolloContext
	) => {
		const { startTerm, startYear, endTerm, endYear } = args;
		console.log('🔥 student_courses resolver fired for:', course.subject)


		const loader = loaders.getStudentCoursesLoader(
			startTerm,
			startYear,
			endTerm,
			endYear
		);
		console.log("LOADER: ", loader);

		return loader.load([
			course.subject,
			course.number,
			course.suffix
		].join('|'));
	}
}