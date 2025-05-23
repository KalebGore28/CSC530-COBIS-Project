import React, { Suspense } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { Skeleton } from '../ui/skeleton';

import type { currentTermTableQuery } from "./__generated__/currentTermTableQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

const currentTermTableQuery = graphql`
	query currentTermTableQuery($mnumber: String!, $startTerm: String, $startYear: Int) {
		instructor(mnumber: $mnumber) {
			courses_taught(startTerm: $startTerm, startYear: $startYear) {
				course {
					title
					subject
					number
					suffix
				}
				credit_hour
				course_section
				total_students
				total_credit_hours
			}
		}
	}
`;

// Custom skeleton for CurrentTermTable
const CurrentTermTableSkeleton: React.FC = () => {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[100px]">Course</TableHead>
					<TableHead className="w-[100px]">Title</TableHead>
					<TableHead className="w-[100px]">Credit Hours</TableHead>
					<TableHead className="w-[100px]">Total Students</TableHead>
					<TableHead className="w-[100px]">Total Credit Hours</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: 5 }).map((_, index) => (
					<TableRow key={index}>
						<TableCell><Skeleton className="h-4 w-24" /></TableCell>
						<TableCell><Skeleton className="h-4 w-24" /></TableCell>
						<TableCell><Skeleton className="h-4 w-24" /></TableCell>
						<TableCell><Skeleton className="h-4 w-24" /></TableCell>
						<TableCell><Skeleton className="h-4 w-24" /></TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

export const CurrentTermTable: React.FC<{ mnumber: string, startTerm: string, startYear: number }> = ({
	mnumber,
	startTerm,
	startYear
}) => {
	return (
		<Suspense fallback={<CurrentTermTableSkeleton />}>
			<CurrentTermTableContent mnumber={mnumber} startTerm={startTerm} startYear={startYear} />
		</Suspense>
	);
}

const CurrentTermTableContent: React.FC<{ mnumber: string, startTerm: string, startYear: number }> = ({
	mnumber,
	startTerm,
	startYear
}) => {

	const data = useLazyLoadQuery<currentTermTableQuery>(
		currentTermTableQuery,
		{
			mnumber,
			startTerm,
			startYear
		},
		{ fetchPolicy: "store-or-network" }
	);

	if (!data.instructor?.courses_taught || data.instructor.courses_taught.length === 0) {
		return (
			<div className='border rounded-lg'>
				<p className='p-4 text-center text-muted-foreground'>
					No courses taught in the current term.
					<br />
					Please check back later.
					<br />
					Or contact the COBIS admin for more information.
				</p>
			</div>
		);
	}

	return (
		<div className='border rounded-lg'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className='max-w-[120px] truncate'>Course</TableHead>
						<TableHead className='max-w-[120px] truncate'>Title</TableHead>
						<TableHead className='max-w-[120px] truncate'>Total Students</TableHead>
						<TableHead className='max-w-[120px] truncate'>Total Credit Hours</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.instructor?.courses_taught.map((course) => (
						<TableRow key={course.course_section}>
							<TableCell className='max-w-[120px] truncate'>
								{`${course.course.subject} ${course.course.number}${course.course.suffix}`}
							</TableCell>
							<TableCell className='max-w-[120px] truncate'>{course.course.title}</TableCell>
							<TableCell className='max-w-[120px] truncate'>{course.total_students}</TableCell>
							<TableCell className='max-w-[120px] truncate'>{course.total_credit_hours}</TableCell>
						</TableRow>
					))}
				</TableBody>

			</Table>
		</div>
	);
}