"use client";

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
import { gql } from "graphql-request";

export interface Term {
	termCode: string;
	termName: string;
	year: number;
	courseCount: number;
	studentCount: number;
	creditHoursDelivered: number;
}

export interface TermSelectorProps {
	mnumber: string | null;
	onTermSelect?: (term: Term) => void;
	onError?: (error: any) => void;
	showStats?: boolean;
}

const GRAPHQL_ENDPOINT = "/api/graphql";

// 1️⃣ Query just year + code for dropdown
const GET_TERMS = gql`
  query GetInstructorTerms($mnumber: String!) {
    instructor(mnumber: $mnumber) {
      courses_taught {
        year
        term {
          description
          code
        }
      }
    }
  }
`;

// 2️⃣ Query detailed stats for one term
const GET_TERM_STATS = gql`
  query GetTermStats(
    $mnumber: String!
    $startTerm: String!
    $startYear: Int!
    $endTerm: String!
    $endYear: Int!
  ) {
    instructor(
      mnumber: $mnumber
    ) {
      courses_taught(
        startTerm: $startTerm
        startYear: $startYear
        endTerm: $endTerm
        endYear: $endYear
      ) {
        year
        term {
          description
          code
        }
        students {
          mnumber
          course_hours
        }
      }
    }
  }
`;

export const TermSelector: React.FC<TermSelectorProps> = ({
	mnumber,
	onTermSelect,
	onError,
	showStats = true,
}) => {
	const [terms, setTerms] = useState<Term[]>([]);
	const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statsLoading, setStatsLoading] = useState(false);

	// helper to talk to your GraphQL endpoint
	const fetchGraphQL = async (query: string, variables: any) => {
		const res = await fetch(GRAPHQL_ENDPOINT, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query, variables }),
		});
		const json = await res.json();
		if (json.errors) throw new Error(json.errors.map((e: any) => e.message).join("; "));
		return json.data;
	};

	// Load just term/year list once
	useEffect(() => {
		if (!mnumber) return;
		(async () => {
			try {
				setLoading(true);
				const data = await fetchGraphQL(GET_TERMS, { mnumber });
				// Map to Term shape (stats=0 for now)
				const raw = data.instructor.courses_taught as Array<any>;
				const uniq = raw
					.map((ct) => ({
						termCode: ct.term.code,
						termName: ct.term.description,
						year: ct.year,
						courseCount: 0,
						studentCount: 0,
						creditHoursDelivered: 0,
					}))
					// dedupe by code+year
					.filter(
						(t, i, arr) =>
							arr.findIndex((x) => x.termCode === t.termCode && x.year === t.year) === i
					)
					// sort desc
					.sort((a, b) =>
						b.year !== a.year
							? b.year - a.year
							: b.termCode.localeCompare(a.termCode)
					);

				setTerms(uniq);

				// select first term by default
				if (uniq.length) {
					handleTermChange(`${uniq[0].termCode}-${uniq[0].year}`, uniq[0]);
				}
			} catch (err: any) {
				setError(err.message);
				onError?.(err);
			} finally {
				setLoading(false);
			}
		})();
	}, [mnumber]);

	// Fetch stats for one term
	const handleTermChange = async (
		termId: string,
		baseTerm?: Term
	) => {
		const [termCode, yearStr] = termId.split("-");
		const year = parseInt(yearStr);
		const term = baseTerm || terms.find((t) => t.termCode === termCode && t.year === year)!;
		setSelectedTerm(term);
		onTermSelect?.(term);

		// now fetch counts/sums
		try {
			setStatsLoading(true);
			const data = await fetchGraphQL(GET_TERM_STATS, {
				mnumber,
				startTerm: term.termCode,
				startYear: term.year,
				endTerm: term.termCode,
				endYear: term.year,
			});
			const taught = data.instructor.courses_taught as Array<any>;
			const courseCount = taught.length;
			let studentCount = 0;
			let creditHoursDelivered = 0;
			for (const c of taught) {
				studentCount += c.students.length;
				creditHoursDelivered += c.students.reduce(
					(sum: number, s: any) => sum + s.course_hours,
					0
				);
			}

			const full: Term = {
				...term,
				courseCount,
				studentCount,
				creditHoursDelivered,
			};
			setSelectedTerm(full);
			onTermSelect?.(full);
		} catch (err: any) {
			onError?.(err);
		} finally {
			setStatsLoading(false);
		}
	};

	if (loading) return <SkeletonCard showTitle showDescription showDropdown />;
	if (error)
		return (
			<Card className="w-full border-red-200 bg-red-50">
				<CardHeader>
					<CardTitle className="text-red-700">Error Loading Terms</CardTitle>
					<CardDescription className="text-red-600">{error}</CardDescription>
				</CardHeader>
			</Card>
		);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Select Term</CardTitle>
				<CardDescription>Choose a term to view course information</CardDescription>
			</CardHeader>
			<CardContent>
				<Select
					value={selectedTerm ? `${selectedTerm.termCode}-${selectedTerm.year}` : ""}
					onValueChange={(val) => handleTermChange(val)}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a term" />
					</SelectTrigger>
					<SelectContent>
						{terms.map((t) => (
							<SelectItem key={`${t.termCode}-${t.year}`} value={`${t.termCode}-${t.year}`}>
								{t.termName} {t.year}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardContent>

			{showStats && selectedTerm && (
				<CardFooter className="flex flex-wrap gap-2">
					{statsLoading ? (
						<SkeletonCard showDropdown={false} showTitle={false} showDescription />
					) : (
						<>
							<Badge variant="outline" className="bg-blue-50">
								{selectedTerm.courseCount} {selectedTerm.courseCount === 1 ? "Course" : "Courses"}
							</Badge>
							<Badge variant="outline" className="bg-green-50">
								{selectedTerm.studentCount} {selectedTerm.studentCount === 1 ? "Student" : "Students"}
							</Badge>
							<Badge variant="outline" className="bg-purple-50">
								{selectedTerm.creditHoursDelivered} Credit Hours
							</Badge>
						</>
					)}
				</CardFooter>
			)}
		</Card>
	);
};

export default TermSelector;
