import React, { Suspense, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { FixedSizeList as List } from 'react-window';

// GraphQL imports
import type { coursesPageQuery } from './__generated__/coursesPageQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

const coursesPageQuery = graphql`
	query coursesPageQuery {
		courses {
			subject
			suffix
			number
			title
			last_updated
			hours
			fee
			web_fee
		}
	}
`;

export const CoursesPage: React.FC = () => {
	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle>Courses</CardTitle>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<Skeleton className="h-6 w-1/2" />}>
						<CourseList />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}

const CourseList: React.FC = () => {
	const navigate = useNavigate();
	const data = useLazyLoadQuery<coursesPageQuery>(
		coursesPageQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);
	const courses = data.courses ?? [];

	const [search, setSearch] = useState('');
	const filtered = useMemo(
		() =>
			courses.filter((c) =>
				`${c.subject}${c.number}${c.suffix}-${c.title}`
					.toLowerCase()
					.includes(search.trim().toLowerCase())
			),
		[courses, search]
	);

	return (
		<div className="space-y-4">
			<Input
				placeholder="Search courses..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="max-w-sm"

			/>

			<div className="text-sm text-muted-foreground">
				Showing {filtered.length} of {courses.length} courses
			</div>

			<List
				height={500}
				itemCount={filtered.length}
				itemSize={50}
				width="100%"
			>
				{({ index, style }) => {
					const course = filtered[index];
					return (
						<div
							key={`${course.subject}-${course.number}-${course.suffix}`}
							style={style}
							className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
							onClick={() =>
								navigate(`/enrollment/courses/${course.subject}${course.number}${course.suffix}`)
							}
						>
							<div className="flex justify-between">
								<span>
									{course.subject}{course.number}{course.suffix} - {course.title}
								</span>
								<span className="text-sm text-gray-500">
									Hours: {course.hours}, Fee: ${course.fee}, Web Fee: ${course.web_fee}
								</span>
							</div>
						</div>
					);
				}}
			</List>
		</div>
	);
};