import { courses } from '../../schema';
import type { ApolloContext } from '@/middleware/apollo-server-context';

type Course = typeof courses.$inferSelect;

export const courseTypeExtension = /* GraphQL */ `
  extend type CoursesSelectItem {
    student_courses(
      startTerm: String!
      startYear: Int!
      endTerm: String!
      endYear: Int!
    ): [StudentCoursesSelectItem]
  }
`;

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