import React from 'react';
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
	const { mnumber } = useOutletContext<EnrollmentContext>();

	return (
		<TermHistoryTable mnumber={mnumber as string} />
	);
};