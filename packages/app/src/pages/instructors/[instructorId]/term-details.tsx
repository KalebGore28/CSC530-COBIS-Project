import React, { Suspense, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSetBreadcrumb } from '@/context/breadcrumb';
import { SelectedTermTable } from '@/components/instructor/selected-term-table';
import { CourseGradeChart } from '@/components/charts/course-grade-distributions';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	BookOpen,
	Users,
	Calculator
} from 'lucide-react';
import { AdvisedStudents } from '@/components/advised-students';
import { Skeleton } from '@/components/ui/skeleton';

import type { termDetailsQuery } from './__generated__/termDetailsQuery.graphql';
import { graphql, useLazyLoadQuery } from "react-relay";

const termDetailsQuery = graphql`
	query termDetailsQuery($mnumber: String!, $startTerm: String, $startYear: Int, $endTerm: String, $endYear: Int) {
		instructor(mnumber: $mnumber) {
			courses_taught(startTerm: $startTerm, startYear: $startYear, endTerm: $endTerm, endYear: $endYear) {
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

// Custom skeleton for TermDetails
const TermDetailsSkeleton: React.FC = () => {
	return (
		<div className="container mx-auto p-6">
			<div className="flex flex-col space-y-6">
				<Skeleton className="h-8 w-1/3" />
				<Skeleton className="h-4 w-1/4" />
				<Skeleton className="h-96 w-full" />
			</div>
		</div>
	);
};

export const TermDetails: React.FC = () => {
	const { mnumber, yearTerm } = useParams();
	const navigate = useNavigate();

	const termCode = yearTerm?.slice(-2);
	const year = yearTerm?.slice(0, 4);

	const termMappings: Record<string, string> = {
		'10': 'Spring',
		'50': 'Summer',
		'80': 'Fall',
		'90': 'Winter'
	};

	useSetBreadcrumb(
		`${year}${termCode}`,
		`${termMappings[termCode as string] || 'Term'} ${year}`,
	);

	return (
		<div className="w-full p-6 mx-auto space-y-6">
			<Button
				variant="outline"
				size="sm"
				className="w-fit"
				onClick={() => navigate(`/instructors/${mnumber}`)}
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Instructor Profile
			</Button>
			<Suspense fallback={<TermDetailsSkeleton />}>
				<TermDetailsContent mnumber={mnumber as string} year={year as string} termCode={termCode as string} />
			</Suspense>
		</div>
	);
}

const TermDetailsContent: React.FC<{
	mnumber: string,
	year: string,
	termCode: string,
}> = ({ mnumber, year, termCode }) => {

	const data = useLazyLoadQuery<termDetailsQuery>(
		termDetailsQuery,
		{
			mnumber: mnumber as string,
			startTerm: termCode as string,
			startYear: parseInt(year as string),
			endTerm: termCode as string,
			endYear: parseInt(year as string)
		},
	);

	if (!data.instructor?.courses_taught || data.instructor.courses_taught.length === 0) {
		return (
			<div className='container mx-auto p-6'>
				<Card className='border rounded-lg'>
					<CardContent className='p-4 text-center text-muted-foreground'>
						No courses taught in the selected term.
					</CardContent>
				</Card>
			</div>
		);
	}

	const summary = useMemo(() => {
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

		return Array.from(map.values())[0];
	}, [data.instructor?.courses_taught]);

	return (
		<div className="w-full mx-auto space-y-6">
			{/* Statistics summary cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<BookOpen className="h-8 w-8 text-primary" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Courses</p>
								<p className="text-3xl font-bold">{summary.totalCourses}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<Users className="h-8 w-8 text-primary" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Students</p>
								<p className="text-3xl font-bold">{summary.totalStudents}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<Calculator className="h-8 w-8 text-primary" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Credit Hours</p>
								<p className="text-3xl font-bold">{summary.totalCreditHours}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Course details table */}
			<Card>
				<CardHeader>
					<CardTitle>Course Details</CardTitle>
					<CardDescription>
						{data.instructor.courses_taught.length} course{data.instructor.courses_taught.length !== 1 ? 's' : ''} taught in {data.instructor.courses_taught[0].term.description} {year}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SelectedTermTable
						mnumber={mnumber}
						startTerm={termCode}
						startYear={parseInt(year)}
					/>
				</CardContent>
			</Card>

			{/* Grade distribution chart */}
			<CourseGradeChart
				mnumber={mnumber}
				term={termCode}
				year={parseInt(year as string)}
			/>

			{/* Advised students */}
			<AdvisedStudents
				mnumber={mnumber}
				title='Advised Students'
				term={termCode}
				year={parseInt(year)}
			/>
		</div>
	);

}