import React from 'react';
import AdvisorAdvisedStudents from '@/components/advisor-advised-students';
import { useSession } from '@/context/session';

const AdvisedStudentsPage: React.FC = () => {
	const { session } = useSession();
	return (
		<div className="container mx-auto p-4 md:p-6">
			<AdvisorAdvisedStudents
				mnumber={session?.info.mnumber || ''}
			/>
		</div>
	);
};

export default AdvisedStudentsPage;