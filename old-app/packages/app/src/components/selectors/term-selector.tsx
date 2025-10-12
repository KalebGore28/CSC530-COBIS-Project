import React, { useState, Suspense } from "react";
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
import { SkeletonCard } from "@/components/loading/selector-skeleton";

// Import types
import type { Term } from "@cobis/types";

// GraphQL imports
import type { termSelectorQuery } from "./__generated__/termSelectorQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

export interface ExtendedTerm extends Term {
	year: number;
	courseCount: number;
	studentCount: number;
	creditHoursDelivered: number;
}

export interface TermSelectorProps {
	mnumber: string | null;
	onTermSelect?: (term: ExtendedTerm) => void;
	showStats?: boolean;
}

const termSelectorQuery = graphql`
  query termSelectorQuery($mnumber: String!) {
    instructor(mnumber: $mnumber) {
      courses_taught {
        year
        term {
          description
          code
        }
        total_students
		total_credit_hours
      }
    }
  }
`;

// Custom skeleton for TermSelectorContent
const TermSelectorSkeleton = () => (
	<>
		<CardContent>
			<Skeleton className="h-8 w-full" /> {/* Mimics SelectTrigger */}
		</CardContent>
		<CardFooter className="flex flex-wrap gap-2">
			<Skeleton className="h-5 w-20" /> {/* Mimics Badge */}
			<Skeleton className="h-5 w-24" /> {/* Mimics Badge */}
			<Skeleton className="h-5 w-28" /> {/* Mimics Badge */}
		</CardFooter>
	</>
);

export const TermSelector: React.FC<TermSelectorProps> = ({
	mnumber,
	onTermSelect,
	showStats = true,
}) => {
	if (!mnumber) {
		return <SkeletonCard />;
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Select Term</CardTitle>
				<CardDescription>Choose a term to view course information</CardDescription>
			</CardHeader>
			<Suspense fallback={<TermSelectorSkeleton />}>
				<TermSelectorContent
					mnumber={mnumber}
					onTermSelect={onTermSelect}
					showStats={showStats}
				/>
			</Suspense>
		</Card>
	);
};

const TermSelectorContent: React.FC<TermSelectorProps> = ({
	mnumber,
	onTermSelect,
	showStats,
}) => {
	if (!mnumber) {
		return <SkeletonCard />;
	}

	const [selectedTerm, setSelectedTerm] = useState<ExtendedTerm | null>(null);

	const data = useLazyLoadQuery<termSelectorQuery>(
		termSelectorQuery,
		{ mnumber },
		{ fetchPolicy: "store-or-network" }
	);


	if (!data.instructor?.courses_taught) {
		return (
			<CardContent>
				<p>No courses found for the selected instructor.</p>
			</CardContent>
		);
	}

	const terms: ExtendedTerm[] = Array.from(
		new Map(
			data.instructor?.courses_taught?.map((course) => [
				`${course.term.code}-${course.year}`,
				{
					code: course.term.code,
					description: course.term.description,
					year: course.year,
					courseCount: 0,
					studentCount: 0,
					creditHoursDelivered: 0,
				},
			]) || []
		).values()
	).sort((a, b) =>
		b.year !== a.year ? b.year - a.year : b.code.localeCompare(a.code)
	);

	const calculateTermStats = (code: string, year: number): ExtendedTerm => {
		const coursesInTerm =
			data.instructor?.courses_taught?.filter(
				(course) => course.term.code === code && course.year === year
			) || [];

		const courseCount = coursesInTerm.length;
		const studentCount = coursesInTerm.reduce(
			(sum, course) => sum + (course.total_students || 0),
			0
		);

		const creditHoursDelivered = coursesInTerm.reduce(
			(sum, course) => sum + (course.total_credit_hours || 0),
			0
		);

		return {
			code,
			description: coursesInTerm[0]?.term.description || "Unknown Term",
			year,
			courseCount,
			studentCount,
			creditHoursDelivered,
		};
	};

	const termsWithStats = terms.map((term) =>
		calculateTermStats(term.code, term.year)
	);

	const handleTermSelect = (termCodeAndYear: string) => {
		const [code, year] = termCodeAndYear.split("-");
		const term = termsWithStats.find(
			(t) => t.code === code && t.year === Number(year)
		);
		if (term) {
			setSelectedTerm(term);
			onTermSelect?.(term);
		}
	};

	return (
		<>
			<CardContent>
				<Select
					value={selectedTerm ? `${selectedTerm.code}-${selectedTerm.year}` : ""}
					onValueChange={handleTermSelect}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a term" />
					</SelectTrigger>
					<SelectContent>
						{termsWithStats.map((term) => (
							<SelectItem
								key={`${term.code}-${term.year}`}
								value={`${term.code}-${term.year}`}
							>
								{term.description} ({term.year})
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardContent>
			{showStats && selectedTerm && (
				<CardFooter className="flex flex-wrap gap-2">
					<Badge variant="outline" className="bg-blue-50 dark:bg-blue-900">
						{selectedTerm.courseCount}{" "}
						{selectedTerm.courseCount === 1 ? "Course" : "Courses"}
					</Badge>
					<Badge variant="outline" className="bg-green-50 dark:bg-green-900">
						{selectedTerm.studentCount}{" "}
						{selectedTerm.studentCount === 1 ? "Student" : "Students"}
					</Badge>
					<Badge variant="outline" className="bg-purple-50 dark:bg-purple-900">
						{selectedTerm.creditHoursDelivered} Credit Hours
					</Badge>
				</CardFooter>
			)}
		</>
	);
};

export default TermSelector;