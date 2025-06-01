import React, { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import { useSetBreadcrumb } from '@/context/breadcrumb';
import type { Course } from '@cobis/types';

import { AgeHistogram } from '@/components/program/age-histogram';
import { type StudentDatum, GenderCitizenship } from '@/components/program/gender-citizenship-chart';
import { type TermRange, TermRangeSelector, TermRangeSelectorSkeleton } from '@/components/selectors/term-range-selector';
import { type Enrollment, EnrollmentTrends } from '@/components/program/enrollment-trends';

// GraphQL imports
import type { detailsCourseCurrentTermQuery } from './__generated__/detailsCourseCurrentTermQuery.graphql';
import type { detailsCourseStudentsQuery } from './__generated__/detailsCourseStudentsQuery.graphql';
import type { detailsCourseQuery } from './__generated__/detailsCourseQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

const detailsCourseCurrentTermQuery = graphql`
	query detailsCourseCurrentTermQuery {
		getCurrentYearTerm {
			year
			term {
				code
				description
			}
		}
	}
`;

const detailsCourseQuery = graphql`
	query detailsCourseQuery($subject: String!, $number: Int!, $suffix: String!) {
		course(subject: $subject, number: $number, suffix: $suffix) {
			subject
			number
			suffix
			title
			hours
			fee
			web_fee
			last_updated
		}
	}
`;

const detailsCourseStudentsQuery = graphql`
	query detailsCourseStudentsQuery($subject: String!, $number: Int!, $suffix: String!, $startYear: Int!, $endTerm: String!, $endYear: Int!, $startTerm: String!) {
		course(subject: $subject, number: $number, suffix: $suffix) {
			student_courses(startYear: $startYear, endTerm: $endTerm, endYear: $endYear, startTerm: $startTerm) {
				student {
					age
					citizenship
					gender
				}
				term {
					code
					description
				}
				year
			}
		}
	}
`;

const CourseDetailsHeaderSkeleton: React.FC = () => (
	<Card className="col-span-2">
		<CardHeader>
			<CardTitle>
				<Skeleton className="h-6 w-3/4" />
			</CardTitle>
			<CardDescription>
				<Skeleton className="h-4 w-1/2" />
			</CardDescription>
		</CardHeader>
		<CardContent>
			<Skeleton className="h-4 w-full mb-2" />
			<Skeleton className="h-4 w-full mb-2" />
			<Skeleton className="h-4 w-full" />
		</CardContent>
	</Card>
);

type MinimumCourse =
	Omit<Course, 'title' | 'hours' | 'fee' | 'web_fee' | 'last_updated' | 'department' | 'college'>;

export const CourseDetails: React.FC = () => {
	const navigate = useNavigate();
	const { courseId } = useParams<{ courseId: string }>();
	const [termRange, setTermRange] = useState<TermRange | null>(null);

	if (!courseId) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Invalid Course ID</CardTitle>
					<CardDescription>
						The course ID provided is invalid. Please check the URL.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const courseParams = courseId.match(/^([A-Z]+)(\d+)([A-Za-z]*)$/);
	if (!courseParams) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Invalid Course Format</CardTitle>
					<CardDescription>
						The course ID format is incorrect. Expected format: {`<Subject><Number><Suffix>`}.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const course: MinimumCourse = {
		subject: courseParams[1],
		number: parseInt(courseParams[2], 10),
		suffix: courseParams[3] || '',
	}

	return (
		<div className="w-full p-6 mx-auto space-y-6">
			<Button
				variant="outline"
				size="sm"
				className="w-fit"
				onClick={() => navigate(`/enrollment/courses`)}
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Courses
			</Button>
			<div className="grid grid-cols-2 gap-4">
				<Suspense fallback={<CourseDetailsHeaderSkeleton />}>
					<CourseDetailsHeader course={course} />
				</Suspense>
				<Suspense fallback={<TermRangeSelectorSkeleton />}>
					<CourseDetailsTermRangeSelector onChange={(range) => setTermRange(range)} />
				</Suspense>

				{termRange && (
					<Suspense fallback={
						<div className="col-span-2 space-y-4">
							<Skeleton className="h-64 w-full" />
							<Skeleton className="h-64 w-full" />
						</div>
					}>
						<CourseDetailsContent course={course} termRange={termRange} />
					</Suspense>
				)}
			</div>
		</div>
	)
}

const CourseDetailsHeader: React.FC<{ course: MinimumCourse, className?: string }> = ({ course }) => {
	const data = useLazyLoadQuery<detailsCourseQuery>(
		detailsCourseQuery,
		{
			subject: course.subject,
			number: course.number,
			suffix: course.suffix,
		},
		{ fetchPolicy: "store-or-network" }
	);

	if (!data.course) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Course Not Found</CardTitle>
					<CardDescription>
						The requested course does not exist or is not available.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	useSetBreadcrumb(
		`${course.subject} ${course.number}${course.suffix}`,
		data.course.title || 'Course Details',
	);

	const { title, hours, fee, web_fee, last_updated } = data.course;

	return (
		<Card className='col-span-2'>
			<CardHeader>
				<CardTitle>Course Details</CardTitle>
				<CardDescription>
					Details for course: {course.subject}{course.number}{course.suffix}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<strong>Course Code:</strong> {course.subject}{course.number}{course.suffix}
					</div>
					<div>
						<strong>Title:</strong> {title}
					</div>
					<div>
						<strong>Credit Hours:</strong> {hours}
					</div>
					<div>
						<strong>Fee:</strong> ${fee.toFixed(2)}
					</div>
					<div>
						<strong>Web Fee:</strong> ${web_fee.toFixed(2)}
					</div>
					<div>
						<strong>Last Updated:</strong> {last_updated ? new Date(last_updated).toLocaleDateString() : 'N/A'}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

const CourseDetailsTermRangeSelector: React.FC<{ onChange: (range: TermRange) => void }> = ({ onChange }) => {
	const { getCurrentYearTerm } = useLazyLoadQuery<detailsCourseCurrentTermQuery>(
		detailsCourseCurrentTermQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);

	useEffect(() => {
		if (getCurrentYearTerm) {
			onChange({
				startYear: getCurrentYearTerm.year,
				startTerm: '10', // Spring
				endYear: getCurrentYearTerm.year,
				endTerm: '90', // Winter
			});
		}
	}, [getCurrentYearTerm]);


	return (
		<TermRangeSelector
			years={Array.from(
				{ length: 10 },
				(_, i) => getCurrentYearTerm.year - i
			)}
			onChange={(range: TermRange) => onChange(range)}
			defaultValue={{
				startYear: getCurrentYearTerm.year,
				startTerm: '10', // Spring
				endYear: getCurrentYearTerm.year,
				endTerm: '90', // Winter
			}}
		/>
	);
}

const CourseDetailsContent: React.FC<{ course: MinimumCourse, termRange: TermRange }> = ({ course, termRange }) => {
	const data = useLazyLoadQuery<detailsCourseStudentsQuery>(
		detailsCourseStudentsQuery,
		{
			subject: course.subject,
			number: course.number,
			suffix: course.suffix,
			startYear: termRange.startYear,
			startTerm: termRange.startTerm,
			endYear: termRange.endYear,
			endTerm: termRange.endTerm,
		},
		{ fetchPolicy: 'store-or-network' }
	);

	if (!data.course) return null;

	const ages: number[] = data.course.student_courses.map(
		(sc) => sc.student.age
	);

	const genderCitizenship: StudentDatum[] = data.course.student_courses.map(
		(sc) => ({
			citizenship: sc.student.citizenship as 'US' | 'International',
			gender: sc.student.gender as 'M' | 'F',
		})
	);

	const enrollments: Enrollment[] = data.course.student_courses.map(
		(sc) => ({
			year: sc.year,
			term: {
				code: sc.term.code as '10' | '50' | '80' | '90',
				description: sc.term.description,
			},
		})
	);

	return (
		<>
			<EnrollmentTrends
				enrollments={enrollments}
				title="Enrollment Trends"
				className='col-span-2'
			/>


			<AgeHistogram
				data={ages}
				className='col-span-2 md:col-span-1'
				binSize={5}
			/>

			<GenderCitizenship
				data={genderCitizenship}
				className='col-span-2 md:col-span-1'
			/>
		</>
	);
}