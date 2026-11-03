import { useLiveQuery } from "@tanstack/react-db";

import { academicStandingCollection } from "@/integrations/tanstack-db/academic-standing";
import { admitCodesCollection } from "@/integrations/tanstack-db/admit-codes";
import { collegesCollection } from "@/integrations/tanstack-db/colleges";
import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { coursePrefixesCollection } from "@/integrations/tanstack-db/course-prefixes";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { instructionalMethodsCollection } from "@/integrations/tanstack-db/instructional-methods";
import { partOfTermCollection } from "@/integrations/tanstack-db/part-of-term";
import { programsCollection } from "@/integrations/tanstack-db/programs";
import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";

// Matches the table page paths under /tools/manage-tables
export type ManagedTableSlug =
  | "academic-standings"
  | "admit-codes"
  | "colleges"
  | "courses"
  | "course-prefixes"
  | "departments"
  | "instructional-methods"
  | "part-of-terms"
  | "programs"
  | "registration-statuses";

export type TableProblem = {
  label: string;
  count: number;
  // Opens the table filtered to just these rows
  filterColumn: string;
  filterValue: string;
};

export type ManagedTable = {
  slug: ManagedTableSlug;
  name: string;
  problems: Array<TableProblem>;
};

// Imports fill in unknown values with placeholder text like "Unknown"
const isUnknown = (value: string | null): boolean => {
  return value?.toLowerCase().startsWith("unknown") ?? false;
};

const missingDescription = (count: number): TableProblem => ({
  label: "missing description",
  count,
  filterColumn: "description",
  filterValue: "unknown",
});

const missingDepartment = (count: number): TableProblem => ({
  label: "missing department",
  count,
  filterColumn: "department_id",
  filterValue: "null",
});

const missingCollege = (count: number): TableProblem => ({
  label: "missing college",
  count,
  filterColumn: "college_id",
  filterValue: "null",
});

export function useTableProblems() {
  const academicStandings = useLiveQuery((q) => q.from({ rows: academicStandingCollection }));
  const admitCodes = useLiveQuery((q) => q.from({ rows: admitCodesCollection }));
  const colleges = useLiveQuery((q) => q.from({ rows: collegesCollection }));
  const courses = useLiveQuery((q) => q.from({ rows: coursesCollection }));
  const coursePrefixes = useLiveQuery((q) => q.from({ rows: coursePrefixesCollection }));
  const departments = useLiveQuery((q) => q.from({ rows: departmentsCollection }));
  const instructionalMethods = useLiveQuery((q) =>
    q.from({ rows: instructionalMethodsCollection }),
  );
  const partOfTerms = useLiveQuery((q) => q.from({ rows: partOfTermCollection }));
  const programs = useLiveQuery((q) => q.from({ rows: programsCollection }));
  const registrationStatuses = useLiveQuery((q) => q.from({ rows: registrationStatusCollection }));

  const isLoading =
    academicStandings.isLoading ||
    admitCodes.isLoading ||
    colleges.isLoading ||
    courses.isLoading ||
    coursePrefixes.isLoading ||
    departments.isLoading ||
    instructionalMethods.isLoading ||
    partOfTerms.isLoading ||
    programs.isLoading ||
    registrationStatuses.isLoading;

  const tables: Array<ManagedTable> = [
    {
      slug: "academic-standings",
      name: "Academic Standings",
      problems: [
        missingDescription(academicStandings.data.filter((r) => isUnknown(r.description)).length),
      ],
    },
    {
      slug: "admit-codes",
      name: "Admit Codes",
      problems: [
        missingDescription(admitCodes.data.filter((r) => isUnknown(r.description)).length),
      ],
    },
    {
      slug: "colleges",
      name: "Colleges",
      problems: [missingDescription(colleges.data.filter((r) => isUnknown(r.description)).length)],
    },
    {
      slug: "courses",
      name: "Courses",
      problems: [
        {
          label: "missing title",
          count: courses.data.filter((r) => isUnknown(r.title)).length,
          filterColumn: "title",
          filterValue: "unknown",
        },
        missingDepartment(courses.data.filter((r) => r.department_id === null).length),
        missingCollege(courses.data.filter((r) => r.college_id === null).length),
      ],
    },
    {
      slug: "course-prefixes",
      name: "Course Prefixes",
      problems: [
        missingDepartment(coursePrefixes.data.filter((r) => r.department_id === null).length),
        missingCollege(coursePrefixes.data.filter((r) => r.college_id === null).length),
      ],
    },
    {
      slug: "departments",
      name: "Departments",
      problems: [
        missingDescription(departments.data.filter((r) => isUnknown(r.description)).length),
        missingCollege(departments.data.filter((r) => r.college_id === null).length),
      ],
    },
    {
      slug: "instructional-methods",
      name: "Instructional Methods",
      problems: [
        missingDescription(
          instructionalMethods.data.filter((r) => isUnknown(r.description)).length,
        ),
      ],
    },
    {
      slug: "part-of-terms",
      name: "Parts of Term",
      problems: [
        missingDescription(partOfTerms.data.filter((r) => isUnknown(r.description)).length),
      ],
    },
    {
      slug: "programs",
      name: "Programs",
      problems: [
        missingDescription(programs.data.filter((r) => isUnknown(r.description)).length),
        missingDepartment(programs.data.filter((r) => r.department_id === null).length),
        missingCollege(programs.data.filter((r) => r.college_id === null).length),
      ],
    },
    {
      slug: "registration-statuses",
      name: "Registration Statuses",
      problems: [
        missingDescription(
          registrationStatuses.data.filter((r) => isUnknown(r.description)).length,
        ),
      ],
    },
  ];

  // Only problems that actually have rows, so a table with none reads as "No issues"
  const tablesWithCounts = tables.map((table) => ({
    ...table,
    problems: table.problems.filter((problem) => problem.count > 0),
  }));

  return { tables: tablesWithCounts, isLoading };
}
