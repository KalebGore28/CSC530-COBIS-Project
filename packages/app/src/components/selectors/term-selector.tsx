import React, { useState, useEffect } from "react";
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
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/loading/selector-skeleton";
import { Term } from "@cobis/types";

// GraphQL imports
import type { termSelectorQuery } from "./__generated__/termSelectorQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

// Extend the base Term type for component-specific fields
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
        students {
          course_hours
        }
      }
    }
  }
`;

export const TermSelector: React.FC<TermSelectorProps> = ({
	mnumber,
	onTermSelect,
	showStats = true,
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

	// Create a deduplicated list of terms for the dropdown
	const terms: ExtendedTerm[] = Array.from(
		new Map(
			data.instructor?.courses_taught?.map((course) => [
				`${course.term.code}-${course.year}`,
				{
					code: course.term.code,
					description: course.term.description,
					year: course.year,
					courseCount: 0, // Will be calculated later
					studentCount: 0,
					creditHoursDelivered: 0,
				},
			]) || []
		).values()
	).sort((a, b) =>
		b.year !== a.year ? b.year - a.year : b.code.localeCompare(a.code)
	);

	// Calculate stats for each term
	const calculateTermStats = (code: string, year: number): ExtendedTerm => {
		const coursesInTerm = data.instructor?.courses_taught?.filter(
			(course) => course.term.code === code && course.year === year
		) || [];

		const courseCount = coursesInTerm.length;
		const studentCount = coursesInTerm.reduce(
			(sum, course) => sum + (course.students?.length || 0),
			0
		);
		const creditHoursDelivered = coursesInTerm.reduce(
			(sum, course) =>
				sum +
				(course.students?.reduce(
					(hours, student) => hours + (student.course_hours || 0),
					0
				) || 0),
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

	// Update terms with calculated stats
	const termsWithStats = terms.map((term) =>
		calculateTermStats(term.code, term.year)
	);

	// Select the first term by default
	useEffect(() => {
		if (termsWithStats.length > 0 && !selectedTerm) {
			const firstTerm = termsWithStats[0];
			setSelectedTerm(firstTerm);
			onTermSelect?.(firstTerm);
		}
	}, [termsWithStats, onTermSelect]);

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
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Select Term</CardTitle>
				<CardDescription>Choose a term to view course information</CardDescription>
			</CardHeader>
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
		</Card>
	);
};

export default TermSelector;