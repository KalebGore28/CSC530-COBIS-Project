"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Term interface representing a term summary from the API
 */
export interface Term {
	termCode: string;
	termName: string;
	year: number;
	courseCount: number;
	studentCount: number;
	creditHoursDelivered: number;
}

/**
 * Props for the TermSelector component
 */
export interface TermSelectorProps {
	/** The instructor's M number */
	mnumber: string | null;
	/** Callback function when term is selected */
	onTermSelect?: (term: Term) => void;
	/** Callback function when error occurs */
	onError?: (error: any) => void;
	/** Whether to show term statistics (default: true) */
	showStats?: boolean;
}

/**
 * TermSelector Component
 * 
 * A self-contained component that fetches instructor terms and provides a dropdown
 * selection interface. The selected term data is made available to parent components.
 */
export const TermSelector: React.FC<TermSelectorProps> = ({
	mnumber,
	onTermSelect,
	onError,
	showStats = true,
}) => {
	const [terms, setTerms] = useState<Term[]>([]);
	const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTerms = async () => {
			if (!mnumber) return;

			try {
				setLoading(true);
				const response = await axios.get(
					`/api/instructor/${mnumber}/terms`,
					{
						withCredentials: true,
					}
				);

				// Sort terms by year (descending) and then by termCode
				const sortedTerms = [...response.data.termSummaries].sort((a, b) => {
					if (a.year !== b.year) return b.year - a.year;
					return b.termCode - a.termCode;
				});

				setTerms(sortedTerms);

				// Select the most recent term by default
				if (sortedTerms.length > 0) {
					setSelectedTerm(sortedTerms[0]);
					if (onTermSelect) onTermSelect(sortedTerms[0]);
				}
			} catch (err: any) {
				console.error("Error fetching terms:", err);
				setError(err.message || "Failed to load terms");
				if (onError) onError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchTerms();
	}, [mnumber]);

	const handleTermChange = (termId: string) => {
		const [termCode, year] = termId.split("-");
		const term = terms.find(
			(t) => t.termCode === termCode && t.year === parseInt(year)
		);
		if (term) {
			setSelectedTerm(term);
			if (onTermSelect) onTermSelect(term);
		}
	};

	// Format term for display: "FALL 2023"
	const formatTermDisplay = (term: Term) => {
		return `${term.termName} ${term.year}`;
	};

	// Create a unique ID for each term
	const getTermId = (term: Term) => {
		return `${term.termCode}-${term.year}`;
	};

	if (loading) {
		return (
			<Card className="w-full">
				<CardHeader>
					<Skeleton className="h-4 w-1/2" />
					<Skeleton className="h-3 w-1/3" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-10 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="w-full border-red-200 bg-red-50">
				<CardHeader>
					<CardTitle className="text-red-700">Error Loading Terms</CardTitle>
					<CardDescription className="text-red-600">
						{error}
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Select Term</CardTitle>
				<CardDescription>
					Choose a term to view course information
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Select
					value={selectedTerm ? getTermId(selectedTerm) : ""}
					onValueChange={handleTermChange}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a term" />
					</SelectTrigger>
					<SelectContent>
						{terms.map((term) => (
							<SelectItem key={getTermId(term)} value={getTermId(term)}>
								{formatTermDisplay(term)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardContent>

			{showStats && selectedTerm && (
				<CardFooter className="flex flex-wrap gap-2">
					<Badge variant="outline" className="bg-blue-50">
						{selectedTerm.courseCount} {selectedTerm.courseCount === 1 ? "Course" : "Courses"}
					</Badge>
					<Badge variant="outline" className="bg-green-50">
						{selectedTerm.studentCount} {selectedTerm.studentCount === 1 ? "Student" : "Students"}
					</Badge>
					<Badge variant="outline" className="bg-purple-50">
						{selectedTerm.creditHoursDelivered} Credit Hours
					</Badge>
				</CardFooter>
			)}
		</Card>
	);
};

export default TermSelector;