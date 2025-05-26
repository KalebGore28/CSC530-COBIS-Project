import React, { Suspense, useMemo } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

// GraphQL imports
import type { termHistoryTableQuery } from "./__generated__/termHistoryTableQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

const termHistoryTableQuery = graphql`
	query termHistoryTableQuery($mnumber: String!) {
		instructor(mnumber: $mnumber) {
			courses_taught {
				total_credit_hours
				total_students
				year
				term {
					code
					description
				}
			}
		}
	}
`;

// Custom skeleton for TermHistoryTable
const TermHistoryTableSkeleton: React.FC = () => (
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead className="w-1/4">Term</TableHead>
				<TableHead className="w-1/4">Total Courses</TableHead>
				<TableHead className="w-1/4">Total Students</TableHead>
				<TableHead className="w-1/4">Total Credit Hours</TableHead>
				<TableHead className="w-1/4">Action</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{Array.from({ length: 4 }).map((_, index) => (
				<TableRow key={index}>
					<TableCell><Skeleton className="h-6 w-full" /></TableCell>
					<TableCell><Skeleton className="h-6 w-full" /></TableCell>
					<TableCell><Skeleton className="h-6 w-full" /></TableCell>
					<TableCell><Skeleton className="h-6 w-full" /></TableCell>
					<TableCell><Skeleton className="h-6 w-full" /></TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export const TermHistoryTable: React.FC<{ mnumber: string }> = ({ mnumber }) => {
	return (
		<Suspense fallback={<TermHistoryTableSkeleton />}>
			<TermHistoryTableContent mnumber={mnumber} />
		</Suspense>
	);
}

export const TermHistoryTableContent: React.FC<{ mnumber: string }> = ({ mnumber }) => {
	const data = useLazyLoadQuery<termHistoryTableQuery>(
		termHistoryTableQuery,
		{ mnumber }
	);
	const navigate = useNavigate();

	// 1. group + accumulate
	const summaries = useMemo(() => {
		const map = new Map<string, {
			year: number;
			term: { code: string; description: string };
			totalCourses: number;
			totalStudents: number;
			totalCreditHours: number;
		}>();

		data.instructor?.courses_taught.forEach(course => {
			const key = `${course.year}-${course.term.code}`;
			if (!map.has(key)) {
				map.set(key, {
					year: course.year,
					term: course.term,
					totalCourses: 0,
					totalStudents: 0,
					totalCreditHours: 0,
				});
			}
			const agg = map.get(key)!;
			agg.totalCourses += 1;
			agg.totalStudents += course.total_students;
			agg.totalCreditHours += course.total_credit_hours;
		});

		return Array.from(map.values());
	}, [data.instructor?.courses_taught]);

	return (
		<div className='border rounded-lg'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="max-w-[120px] truncate">Term</TableHead>
						<TableHead className="max-w-[120px] truncate">Courses</TableHead>
						<TableHead className="max-w-[120px] truncate">Students</TableHead>
						<TableHead className="max-w-[120px] truncate">Credit Hours</TableHead>
						<TableHead className="max-w-[120px] truncate">Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{summaries.map(({ year, term, totalCourses, totalStudents, totalCreditHours }) => (
						<TableRow key={`${year}-${term.code}`}>
							<TableCell className='max-w-[120px] truncate'>{`${term.description} ${year}`}</TableCell>
							<TableCell className='max-w-[120px] truncate'>{totalCourses}</TableCell>
							<TableCell className='max-w-[120px] truncate'>{totalStudents}</TableCell>
							<TableCell className='max-w-[120px] truncate'>{totalCreditHours}</TableCell>
							<TableCell className='max-w-[120px] truncate'>
								<Button
									variant="outline"
									onClick={() => navigate(`/instructors/${mnumber}/${year}${term.code}`)}
								>
									View Details
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};