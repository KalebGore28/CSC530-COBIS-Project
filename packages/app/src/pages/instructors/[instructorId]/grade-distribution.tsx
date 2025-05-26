import React from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useOutletContext } from "react-router-dom";
import { GradeDistribution } from '@/components/charts/term-grade-distributions';

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

export const GradeDistributionTab: React.FC = () => {
	const { mnumber, getCurrentYearTerm } = useOutletContext<EnrollmentContext>();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Grade Distribution</CardTitle>
				<CardDescription>
					{getCurrentYearTerm.term.description} {getCurrentYearTerm.year}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<GradeDistribution
					mnumber={mnumber as string}
				/>
			</CardContent>
		</Card>
	);
};