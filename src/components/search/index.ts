// src/hooks/useSearchQueries.ts
import { useQueryLoader, usePreloadedQuery } from 'react-relay';
import { graphql } from 'react-relay';

import { searchDepartmentsQuery } from './__generated__/searchDepartmentsQuery.graphql';
import { searchCoursesQuery } from './__generated__/searchCoursesQuery.graphql';
import { searchProgramsQuery } from './__generated__/searchProgramsQuery.graphql';

//
// Departments
//
export const SearchDepartmentsQuery = graphql`
  query searchDepartmentsQuery($query: String!) {
    searchDepartments(query: $query) {
      code
      description
    }
  }
`;

export function useDepartmentSearch() {
  const [queryRef, loadQuery] = useQueryLoader<searchDepartmentsQuery>(
    SearchDepartmentsQuery
  );
  return { queryRef, loadQuery };
}

export function useDepartmentResults(queryRef: any) {
  return usePreloadedQuery<searchDepartmentsQuery>(
    SearchDepartmentsQuery,
    queryRef
  );
}

//
// Courses
//
export const SearchCoursesQuery = graphql`
  query searchCoursesQuery($query: String!) {
    searchCourses(query: $query) {
      subject
      number
      suffix
      title
      hours
      last_updated
      department_code
      college_code
    }
  }
`;

export function useCourseSearch() {
  const [queryRef, loadQuery] = useQueryLoader<searchCoursesQuery>(
    SearchCoursesQuery
  );
  return { queryRef, loadQuery };
}

export function useCourseResults(queryRef: any) {
  return usePreloadedQuery<searchCoursesQuery>(
    SearchCoursesQuery,
    queryRef
  );
}

//
// Programs
//
export const SearchProgramsQuery = graphql`
  query searchProgramsQuery($query: String!) {
    searchPrograms(query: $query) {
      code
      description
      cip_code
      is_major
      is_minor
      has_concentration
      is_discontinued
      is_aacsb
      department_code
      college_code
      last_updated
      department { description }
    }
  }
`;

export function useProgramSearch() {
  const [queryRef, loadQuery] = useQueryLoader<searchProgramsQuery>(
    SearchProgramsQuery
  );
  return { queryRef, loadQuery };
}

export function useProgramResults(queryRef: any) {
  return usePreloadedQuery<searchProgramsQuery>(
    SearchProgramsQuery,
    queryRef
  );
}