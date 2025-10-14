import { useState, Suspense } from "react";
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
import { instructorCourses, terms } from "@/db/schema";

type Term = typeof terms.$inferSelect;
type InstructorCourse = typeof instructorCourses.$inferSelect;

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';


export interface ExtendedTerm extends Term {
	year: number;
	courseCount: number;
	studentCount: number;
	creditHoursDelivered: number;
}

export interface ExtendedCourse
	extends Omit<
		InstructorCourse,
		"mnumber" | "term_code" | "year" | "role"
	> {
	title: string;
	course_section: string;
	creditHours: number;
	studentCount: number;
	totalCreditHours: number;
}

export interface CourseSelectorProps {
	mnumber: string | null;
	selectedTerm: ExtendedTerm | null;
	onCourseSelect?: (course: ExtendedCourse) => void;
	showStats?: boolean;
}

const courseSelectorQuery = graphql(`
  query courseSelectorQuery($mnumber: String!, $term: String!, $year: Int!) {
    facultySingle(where: { mnumber: { eq: $mnumber } }) {
      courses_taught(
        startTerm: $term
        startYear: $year
        endTerm: $term
        endYear: $year
      ) {
        course {
          title
        }
		course_subject
		course_number
		course_suffix
        course_section
        total_students
        total_credit_hours
        credit_hour
      }
    }
  }
`);

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
	`${c.course_subject}|${c.course_number}|${c.course_suffix}|${c.course_section}`;
const formatCourseDisplay = (c: ExtendedCourse) =>
	`${c.course_subject} ${c.course_number}${c.course_suffix}-${c.course_section}: ${c.title}`;

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

	const { data, isLoading } = useQuery({
		queryKey: ['courseSelectorQuery', mnumber, selectedTerm.code, selectedTerm.year],
		queryFn: async () => await execute(courseSelectorQuery, {
			mnumber,
			term: selectedTerm.code,
			year: selectedTerm.year,
		}),
	});

	if (isLoading) {
		return <CourseSelectorSkeleton />;
	}

	const courses =
		data?.facultySingle?.courses_taught
			?.flatMap((c) =>
				c?.course
					? [
						{
							course_subject: c.course_subject,
							course_number: c.course_number,
							course_suffix: c.course_suffix,
							title: c.course.title,
							course_section: c.course_section,
							creditHours: c.credit_hour ?? 0,
							studentCount: c.total_students ?? 0,
							totalCreditHours:
								c.total_credit_hours ?? (c.credit_hour ?? 0) * (c.total_students ?? 0),
						},
					]
					: []
			)
			.sort((a, b) =>
				`${a.course_subject}${a.course_number}${a.course_suffix}-${a.course_section}`.localeCompare(
					`${b.course_subject}${b.course_number}${b.course_suffix}-${b.course_section}`
				)
			) ?? [];

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