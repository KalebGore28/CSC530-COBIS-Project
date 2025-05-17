import React, { useState, Suspense } from "react";
import { format } from "date-fns";

import { StudentFilters } from "@/components/student-filter";
import { FilterState } from "@/components/student-filter";
import { PaginatedTable } from "@/components/common/paginated-table";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


// GraphQL imports
import type { StudentLookupQuery } from "./__generated__/StudentLookupQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

const StudentLookupQuery = graphql`
  query StudentLookupQuery($filters: StudentLookupInput!) {
    lookupStudents(filters: $filters) {
      mnumber
      firstName
      lastName
      email
    }
  }
`;

// Custom skeleton for StudentLookupContent

export interface Student {
	mnumber: string;
	firstName: string;
	lastName: string;
	email: string;
}

const makePreHeader = (filters: FilterState): string[] => {
	const lines: string[] = [];

	if (filters.academicLevels.length) {
		lines.push(`Academic Levels,${filters.academicLevels.join("|")}`);
	}
	if (filters.gpaRange) {
		lines.push(`GPA,${filters.gpaRange[0]}-${filters.gpaRange[1]}`);
	}

	if (Object.keys(filters.programFilters).length) {
		const programLines = Object.entries(filters.programFilters)
			.map(([program, flags]) => {
				const flagsStr = [];
				if (flags.is_major) flagsStr.push("major");
				if (flags.is_minor) flagsStr.push("minor");
				return `${program} (${flagsStr.join(",")})`;
			})
			.join("|");
		lines.push(`Programs,${programLines}`);
	}

	if (Object.keys(filters.courseFilters).length) {
		const courseLines = Object.entries(filters.courseFilters)
			.map(([course, cf]) => {
				const flagsStr = [];
				if (cf.taken) flagsStr.push("taken");
				if (cf.gradeOperator) flagsStr.push(`grade ${cf.gradeOperator}`);
				if (cf.grade) flagsStr.push(`grade ${cf.grade}`);
				return `${course} (${flagsStr.join(",")})`;
			})
			.join("|");
		lines.push(`Courses,${courseLines}`);
	}
	// always add an export timestamp
	lines.push(`Exported At,${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`);

	return lines;
};

export const StudentLookup: React.FC = () => {
	const [currentFilters, setCurrentFilters] = useState<FilterState | null>(null);

	return (
		<div className="p-6">
			<StudentFilters
				onApplyFilters={setCurrentFilters}
				onResetFilters={() => {
					setCurrentFilters(null);
				}}
			/>

			<div className="mt-6">
				<Suspense fallback={<Skeleton className="h-4 w-1/2" />}>
					<StudentLookupContent filters={currentFilters} />
				</Suspense>
			</div>
		</div>
	);
};

type StudentLookupContentProps = {
	filters: FilterState | null;
}

const StudentLookupContent: React.FC<StudentLookupContentProps> = ({ filters }) => {
	if (!filters) {
		return (
			<CardContent>
				<p className="text-sm text-muted-foreground">
					Select filters and click "Run Search" to view students.
				</p>
			</CardContent>
		);
	}

	const formatFilterState = (filters: FilterState) => {
		// Build your GraphQL variables from FilterState
		const gqlFilters: any = {};

		if (filters.academicLevels.length) {
			gqlFilters.academicLevels = filters.academicLevels;
		}
		// Only include GPA if user has narrowed the range off [0,4]
		if (!(filters.gpaRange[0] === 0 && filters.gpaRange[1] === 4)) {
			gqlFilters.gpaMin = filters.gpaRange[0];
			gqlFilters.gpaMax = filters.gpaRange[1];
		}

		// programs: Record<string, { is_major?, is_minor? }>
		const programEntries = Object.entries(filters.programFilters)
			.filter(([, flags]) => flags.is_major || flags.is_minor)
			.map(([program, flags]) => ({
				program,
				is_major: !!flags.is_major,
				is_minor: !!flags.is_minor,
			}));
		if (programEntries.length) {
			gqlFilters.programs = programEntries;
		}

		// courses: Record<string, { taken?, gradeOperator?, grade? }>
		const courseEntries = Object.entries(filters.courseFilters)
			.filter(([, cf]) => cf.taken !== undefined || cf.gradeOperator)
			.map(([course, cf]) => ({
				course,
				taken: cf.taken ?? false,
				operator: cf.gradeOperator,
				grade: cf.grade,
			}));
		if (courseEntries.length) {
			gqlFilters.courses = courseEntries;
		}

		// keep for CSV export
		return gqlFilters;
	};

	const data = useLazyLoadQuery<StudentLookupQuery>(
		StudentLookupQuery,
		{ filters: formatFilterState(filters) },
		{ fetchPolicy: "store-or-network" }
	);

	if (!data.lookupStudents) {
		return (
			<CardContent>
				<p className="text-sm text-muted-foreground">
					No students found.
				</p>
			</CardContent>
		);
	}

	return (
		<CardContent>
			<PaginatedTable<Student>
				className="border"
				data={[...data.lookupStudents]}
				columns={[
					{ key: "mnumber", label: "MNumber" },
					{ key: "firstName", label: "First Name" },
					{ key: "lastName", label: "Last Name" },
					{
						key: "email",
						label: "Email",
						transform: (val) => val.toLowerCase(),
					},
				]}
				rowsPerPage={10}
				preHeader={makePreHeader(filters)}
			/>
		</CardContent>
	);
}