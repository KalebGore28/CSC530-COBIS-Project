import React from 'react';
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
	const { mnumber } = useOutletContext<EnrollmentContext>();

	return (
		<GradeDistribution
			mnumber={mnumber as string}
		/>
	);
};