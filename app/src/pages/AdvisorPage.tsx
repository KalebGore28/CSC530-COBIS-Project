import React from 'react';
import AdvisorAdvisedStudents from '@/components/advisor-advised-students';

const AdvisedStudentsPage: React.FC = () => {
	return (
		<div className="container mx-auto p-4 md:p-6">
			<AdvisorAdvisedStudents />
		</div>
	);
};

export default AdvisedStudentsPage;