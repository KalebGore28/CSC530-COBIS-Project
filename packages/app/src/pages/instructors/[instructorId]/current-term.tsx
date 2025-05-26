import React from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useOutletContext } from "react-router-dom";
import { SelectedTermTable } from '@/components/instructor/selected-term-table';

type EnrollmentContext = {
	mnumber: string;
	getCurrentYearTerm: {
		year: number;
		term: {
			code: string;
			description: string;
		};
	}
};

export const CurrentTermTab: React.FC = () => {
	const { mnumber, getCurrentYearTerm } = useOutletContext<EnrollmentContext>();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Current Term</CardTitle>
				<CardDescription>
					{getCurrentYearTerm.term.description} {getCurrentYearTerm.year}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<SelectedTermTable
					mnumber={mnumber as string}
					startTerm={getCurrentYearTerm.term.code}
					startYear={getCurrentYearTerm.year}
				/>
			</CardContent>
		</Card>
	);
}