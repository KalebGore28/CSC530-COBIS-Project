import React from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useOutletContext } from "react-router-dom";
import { TermHistoryTable } from '@/components/instructor/term-history-table';

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

export const TermHistoryTab: React.FC = () => {
	const { mnumber, getCurrentYearTerm } = useOutletContext<EnrollmentContext>();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Term History</CardTitle>
				<CardDescription>
					{getCurrentYearTerm.term.description} {getCurrentYearTerm.year}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<TermHistoryTable mnumber={mnumber as string} />
			</CardContent>
		</Card>
	);
};