import React, { Suspense } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

// GraphQL imports
import type { selectedTermTableQuery } from "./__generated__/selectedTermTableQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";
import { Button } from '../ui/button';

const selectedTermTableQuery = graphql`
	query selectedTermTableQuery($mnumber: String!, $startTerm: String, $startYear: Int, $endTerm: String, $endYear: Int) {
		instructor(mnumber: $mnumber) {
			courses_taught(startTerm: $startTerm, startYear: $startYear, endTerm: $endTerm, endYear: $endYear) {
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

// Custom skeleton for SelectedTermTable
const SelectedTermTableSkeleton: React.FC = () => {
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

export const SelectedTermTable: React.FC<{ mnumber: string, startTerm: string, startYear: number }> = ({
	mnumber,
	startTerm,
	startYear
}) => {
	return (
		<Suspense fallback={<SelectedTermTableSkeleton />}>
			<SelectedTermTableContent mnumber={mnumber} startTerm={startTerm} startYear={startYear} />
		</Suspense>
	);
}

const SelectedTermTableContent: React.FC<{ mnumber: string, startTerm: string, startYear: number }> = ({
	mnumber,
	startTerm,
	startYear
}) => {
	const navigate = useNavigate();

	const data = useLazyLoadQuery<selectedTermTableQuery>(
		selectedTermTableQuery,
		{
			mnumber,
			startTerm,
			startYear,
			endTerm: startTerm,
			endYear: startYear
		},
		{ fetchPolicy: "store-or-network" }
	);

	if (!data.instructor?.courses_taught || data.instructor.courses_taught.length === 0) {
		return (
			<div className='border rounded-lg'>
				<p className='p-4 text-center text-muted-foreground'>
					No courses taught in the selected term.
				</p>
			</div>
		);
	}

	return (
		<div className='border rounded-lg'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className='max-w-[100px] truncate'>Course</TableHead>
						<TableHead className='max-w-[100px] truncate'>Title</TableHead>
						<TableHead className='max-w-[100px] truncate'>Students</TableHead>
						<TableHead className='max-w-[100px] truncate'>Credit Hours</TableHead>
						<TableHead className='max-w-[100px] truncate'>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.instructor?.courses_taught.map((course) => (
						<TableRow key={course.course_section}>
							<TableCell className='max-w-[100px] truncate'>
								{`${course.course.subject} ${course.course.number}${course.course.suffix}`}
							</TableCell>
							<TableCell className='max-w-[100px] truncate'>{course.course.title}</TableCell>
							<TableCell className='max-w-[100px] truncate'>{course.total_students}</TableCell>
							<TableCell className='max-w-[100px] truncate'>{course.total_credit_hours}</TableCell>
							<TableCell className='max-w-[100px] truncate'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => {
										navigate(`/instructors/${mnumber}/term-history/${startYear}${startTerm}/${course.course.subject}${course.course.number}${course.course.suffix}-${course.course_section}`);
									}}
								>
									View Roster
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>

			</Table>
		</div>
	);
}