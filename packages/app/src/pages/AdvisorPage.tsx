import React from 'react';
import { AdvisedStudents } from '@/components/advised-students';
import { useSession } from '@/context/session';

export const AdvisedStudentsPage: React.FC = () => {
	const { session } = useSession();
	return (
		<div className="mx-auto p-6 w-full">
			<AdvisedStudents
				title='My Advised Students'
				mnumber={session?.info.mnumber || ''}
				modalOpen={true}
			/>
		</div>
	);
};