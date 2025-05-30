import React, { useState, Suspense, useEffect, useMemo } from "react";
import { format } from "date-fns";

import { StudentFilters } from "@/components/student-filter";
import { FilterState } from "@/components/student-filter";
import { PaginatedTable } from "@/components/common/paginated-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCSV } from "@/utils/csv-export";

// GraphQL imports
import type { StudentLookupQuery } from "./__generated__/StudentLookupQuery.graphql";
import { fetchQuery, graphql, useLazyLoadQuery } from 'react-relay';
import { environment } from "@/main";


// Import types
import type { Student } from "@cobis/types";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const StudentLookupQuery = graphql`
  query StudentLookupQuery(
    $filters: StudentLookupInput!
    $offset: Int!
    $limit: Int!
  ) {
    lookupStudents(filters: $filters, offset: $offset, limit: $limit) {
      students {
        mnumber
        first_name
        last_name
        email
      }
      totalCount
    }
  }
`;

const PAGE_LIMIT = 10;

interface StudentBasic
	extends Omit<
		Student,
		"middle_name" | "suffix" | "gender" | "birthdate" | "citizenship" |
		"race_code" | "race_description" | "residency_code" |
		"residency_description" | "age" | "cell_phone"
	> {
}

interface SkeletonTableProps {
	rows?: number;
	columns?: number;
}
// Custom skeleton component
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
	rows = 10,
	columns = 4,
}) => (
	<Card className="w-full animate-pulse">
		<CardHeader className="flex items-center justify-between">
			<Skeleton className="h-6 w-1/4" />
			<Skeleton className="h-8 w-24" />
		</CardHeader>
		<CardContent>
			{/* Info line */}
			<div className="mb-2">
				<Skeleton className="h-4 w-1/3" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						{Array.from({ length: columns }).map((_, idx) => (
							<TableHead key={idx}>
								<Skeleton className="h-4 w-20" />
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: rows }).map((_, rowIdx) => (
						<TableRow key={rowIdx}>
							{Array.from({ length: columns }).map((__, cellIdx) => (
								<TableCell key={cellIdx} className="p-2">
									<Skeleton className="h-4 w-full" />
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
			{/* Pagination buttons */}
			<div className="flex justify-end items-center gap-2 mt-4">
				<Skeleton className="h-8 w-20" />
				<Skeleton className="h-8 w-20" />
			</div>
		</CardContent>
	</Card>
);


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
				<Suspense fallback={<SkeletonTable rows={PAGE_LIMIT} columns={4} />}>
					{currentFilters ?
						<StudentLookupContent filters={currentFilters} />
						: <Card className="w-full text-center">
							<p className="text-sm text-muted-foreground">
								Select filters and click "Run Search" to view students.
							</p>
						</Card>
					}
				</Suspense>
			</div>
		</div>
	);
};

type StudentLookupContentProps = {
	filters: FilterState;
}

const StudentLookupContent: React.FC<StudentLookupContentProps> = ({ filters }) => {

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

	const [offset, setOffset] = useState(0);

	// reset to first page when filters change
	const gqlFilters = useMemo(() => formatFilterState(filters!), [filters]);
	useEffect(() => {
		setOffset(0);
	}, [gqlFilters]);

	const data = useLazyLoadQuery<StudentLookupQuery>(
		StudentLookupQuery,
		{ filters: gqlFilters, offset, limit: PAGE_LIMIT },
		{ fetchPolicy: "store-or-network" }
	);

	if (data.lookupStudents.students.length === 0) {
		return (
			<Card className="w-full text-center">
				<p className="text-sm text-muted-foreground">
					No students found.
				</p>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Student Lookup</h2>
				<Suspense fallback={
					<Button variant="outline" disabled>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Export as CSV
					</Button>
				}>
					<Button
						variant="outline"
						onClick={async () => {
							// 1. figure out how many rows you actually need:
							const total = data.lookupStudents.totalCount;

							// 2. run an imperative fetch for all rows
							const fullPayload = await fetchQuery<StudentLookupQuery>(
								environment,
								StudentLookupQuery,
								{
									filters: gqlFilters,
									offset: 0,
									limit: total,
								}
							).toPromise(); // returns a Promise of your query result

							// 3. guard
							if (!fullPayload?.lookupStudents?.students) {
								console.error('Export failed, no data');
								return;
							}

							// 4. export to CSV
							exportToCSV<StudentBasic>(
								[...fullPayload.lookupStudents.students],
								{
									filename: `students_${format(new Date(), 'yyyyMMdd_HHmmss')}`,
									fields: ['mnumber', 'first_name', 'last_name', 'email'],
									headers: ['mnumber', 'first_name', 'last_name', 'email'], // these must match the fields. most likely didn't initially make it for the headers to be different.
									preHeader: makePreHeader(filters),
								}
							);
						}}
					>
						<Download className="mr-2 h-4 w-4" />
						Export as CSV
					</Button>
				</Suspense>
			</CardHeader>
			<CardContent>
				<PaginatedTable<StudentBasic>
					className="border"
					data={[...data.lookupStudents.students]}
					columns={[
						{ key: "mnumber", label: "MNumber" },
						{ key: "first_name", label: "First Name" },
						{ key: "last_name", label: "Last Name" },
						{
							key: "email",
							label: "Email",
							transform: (val) => val.toLowerCase(),
						},
					]}
					rowsPerPage={PAGE_LIMIT}
					totalRows={data.lookupStudents.totalCount}
					handlePreviousCallback={() =>
						setOffset((prev) => Math.max(prev - PAGE_LIMIT, 0))
					}
					handleNextCallback={() =>
						setOffset((prev) =>
							prev + PAGE_LIMIT < data.lookupStudents.totalCount
								? prev + PAGE_LIMIT
								: prev
						)
					}
				/>
			</CardContent>
		</Card>
	);
}