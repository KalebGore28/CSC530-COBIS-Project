import { useState, useEffect, Suspense } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { courses, terms } from "@/db/schema";
import type { courseSelectorQuery } from "./__generated__/courseSelectorQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

type Term = typeof terms.$inferSelect;
type Course = typeof courses.$inferSelect;

export interface ExtendedTerm extends Term {
	year: number;
	courseCount: number;
	studentCount: number;
	creditHoursDelivered: number;
}

export interface ExtendedCourse
	extends Omit<
		Course,
		"hours" | "fee" | "web_fee" | "last_updated" | "department_code" | "college_code"
	> {
	course_section: string;
	creditHours: number;
	studentCount: number;
	totalCreditHours: number;
	term: ExtendedTerm;
}

export interface CourseSelectorProps {
	mnumber: string | null;
	selectedTerm: ExtendedTerm | null;
	onCourseSelect?: (course: ExtendedCourse) => void;
	showStats?: boolean;
}

const courseSelectorQuery = graphql`
  query courseSelectorQuery($mnumber: String!, $term: String!, $year: Int!) {
    facultySingle(where: { mnumber: { eq: $mnumber } }) {
      courses_taught(
        startTerm: $term
        startYear: $year
        endTerm: $term
        endYear: $year
      ) {
        course {
          subject
          number
          suffix
          title
        }
        course_section
        total_students
        total_credit_hours
        credit_hour
      }
    }
  }
`;

const CourseSelectorSkeleton = () => (
	<>
		<CardContent>
			<Skeleton className="h-8 w-full" />
		</CardContent>
		<CardFooter className="flex flex-wrap gap-2">
			{[24, 20, 28].map((w) => (
				<Skeleton key={w} className={`h-5 w-${w}`} />
			))}
		</CardFooter>
	</>
);

const NoTermCard = ({ message }: { message: string }) => (
	<Card className="w-full">
		<CardHeader>
			<CardTitle>Course Selection</CardTitle>
			<CardDescription>{message}</CardDescription>
		</CardHeader>
		<CardContent>
			<Skeleton className="h-8 w-full" />
		</CardContent>
	</Card>
);

const getCourseId = (c: ExtendedCourse) =>
	`${c.subject}|${c.number}|${c.suffix}|${c.course_section}`;
const formatCourseDisplay = (c: ExtendedCourse) =>
	`${c.subject} ${c.number}${c.suffix}-${c.course_section}: ${c.title}`;

export function CourseSelector({ mnumber, selectedTerm, onCourseSelect, showStats = true }: CourseSelectorProps) {
	if (!mnumber) return <Skeleton className="h-8 w-full" />;
	if (!selectedTerm) return <NoTermCard message="Please select a term first to view available courses" />;
	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Select Course</CardTitle>
				<CardDescription>
					Courses for {selectedTerm.description} {selectedTerm.year}
				</CardDescription>
			</CardHeader>
			<Suspense fallback={<CourseSelectorSkeleton />}>
				<CourseSelectorContent
					mnumber={mnumber}
					selectedTerm={selectedTerm}
					onCourseSelect={onCourseSelect}
					showStats={showStats}
				/>
			</Suspense>
		</Card>
	);
};

function CourseSelectorContent({ mnumber, selectedTerm, onCourseSelect, showStats }: CourseSelectorProps) {
	const [selectedCourse, setSelectedCourse] = useState<ExtendedCourse | null>(null);

	if (!mnumber || !selectedTerm) return null;

	const data = useLazyLoadQuery<courseSelectorQuery>(
		courseSelectorQuery,
		{ mnumber, term: selectedTerm!.code, year: selectedTerm!.year },
		{ fetchPolicy: "store-or-network" }
	);

	const courses =
		data.facultySingle?.courses_taught
			?.flatMap((c) =>
				c?.course
					? [
						{
							subject: c.course.subject,
							number: c.course.number,
							suffix: c.course.suffix,
							title: c.course.title,
							course_section: c.course_section,
							creditHours: c.credit_hour ?? 0,
							studentCount: c.total_students ?? 0,
							totalCreditHours:
								c.total_credit_hours ?? (c.credit_hour ?? 0) * (c.total_students ?? 0),
							term: selectedTerm!
						},
					]
					: []
			)
			.sort((a, b) =>
				`${a.subject}${a.number}${a.suffix}-${a.course_section}`.localeCompare(
					`${b.subject}${b.number}${b.suffix}-${b.course_section}`
				)
			) ?? [];

	useEffect(() => {
		const first = courses[0] ?? null;
		setSelectedCourse(first);
		if (first) onCourseSelect?.(first);
	}, [selectedTerm]);

	if (!courses.length) return null;

	const handleChange = (value: string) => {
		const found = courses.find((c) => getCourseId(c) === value);
		if (found) {
			setSelectedCourse(found);
			onCourseSelect?.(found);
		}
	};

	return (
		<>
			<CardContent>
				<Select
					value={selectedCourse ? getCourseId(selectedCourse) : ""}
					onValueChange={handleChange}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a course" />
					</SelectTrigger>
					<SelectContent>
						{courses.map((c) => (
							<SelectItem key={getCourseId(c)} value={getCourseId(c)}>
								{formatCourseDisplay(c)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardContent>

			{showStats && selectedCourse && (
				<CardFooter className="flex flex-wrap gap-2">
					<Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900">
						{selectedCourse.creditHours} Credit Hours
					</Badge>
					<Badge variant="outline" className="bg-green-50 dark:bg-green-900">
						{selectedCourse.studentCount}{" "}
						{selectedCourse.studentCount === 1 ? "Student" : "Students"}
					</Badge>
					<Badge variant="outline" className="bg-purple-50 dark:bg-purple-900">
						{selectedCourse.totalCreditHours} Total Credit Hours
					</Badge>
				</CardFooter>
			)}
		</>
	);
};