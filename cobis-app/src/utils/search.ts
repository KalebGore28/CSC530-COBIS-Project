import { graphql, useLazyLoadQuery } from "react-relay";
import type { searchCoursesQuery } from "./__generated__/searchCoursesQuery.graphql";
import type { searchDepartmentsQuery } from "./__generated__/searchDepartmentsQuery.graphql";
import type { searchProgramsQuery } from "./__generated__/searchProgramsQuery.graphql";

// For Departments:
export const searchDepartments = async (query: string) => {
	const data = await useLazyLoadQuery<searchDepartmentsQuery>(
		graphql`
			query searchDepartmentsQuery($query: String!) {
				searchDepartments(query: $query) {
					code
					description
				}
			}
		`,
		{ query }
	);
	return data.searchDepartments;
};

// For Courses:
export const searchCourses = async (query: string) => {
	const data = await useLazyLoadQuery<searchCoursesQuery>(
		graphql`
			query searchCoursesQuery($query: String!) {
				searchCourses(query: $query) {
					subject
					number
					suffix
					title
					hours
					last_updated
				}
			}
		`,
		{ query }
	);
	return data.searchCourses;
};

// For Programs:
export const searchPrograms = async (query: string) => {
	const data = await useLazyLoadQuery<searchProgramsQuery>(
		graphql`
			query searchProgramsQuery($query: String!) {
				searchPrograms(query: $query) {
					code
					description
					is_major
					is_minor
					has_concentration
					is_discontinued
					is_aacsb
					department_code
					department { description }
				}
			}
		`,
		{ query }
	);
	return data.searchPrograms;
};