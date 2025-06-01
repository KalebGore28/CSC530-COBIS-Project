import React, { Suspense, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

import { Modal } from '@/components/modals/modal';
import { StudentDetail } from '@/components/student-detail';

// Import types
import type { Student } from '@cobis/types';

// Import GraphQL imports
import type { advisedStudentsGetCurrentTermQuery } from './__generated__/advisedStudentsGetCurrentTermQuery.graphql';
import type { advisedStudentsQuery } from './__generated__/advisedStudentsQuery.graphql';
import { graphql, useLazyLoadQuery } from "react-relay";


interface ExtendedStudent
	extends Omit<
		Student,
		'birthdate' | 'citizenship' | 'race_code' | 'race_description' |
		'residency_code' | 'residency_description' | 'cell_phone'
	> { }


const advisedStudentsGetCurrentTermQuery = graphql`
	query advisedStudentsGetCurrentTermQuery {
		getCurrentYearTerm {
			year
			term {
				code
				description
			}
		}
	}
`;

const advisedStudentsQuery = graphql`
  query advisedStudentsQuery($mnumber: String!, $term: String, $year: Int) {
	instructor(mnumber: $mnumber) {
	  advisees(term: $term, year: $year) {
		student {
			mnumber
			first_name
			middle_name
			last_name
			suffix
			email
			gender
			age
		}
	  }
	}
  }
`;

// Custom skeleton for AdvisedStudents
const AdvisedStudentsSkeleton = () => (
	<Card className='w-full'>
		<CardHeader>
			<CardTitle>
				<Skeleton className="h-6 w-32" />
			</CardTitle>
			<CardDescription>
				<Skeleton className="h-4 w-48" />
			</CardDescription>
		</CardHeader>
		<CardContent className='px-4'>
			<div className="overflow-auto rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead><Skeleton className="h-4 w-24" /></TableHead>
							<TableHead><Skeleton className="h-4 w-40" /></TableHead>
							<TableHead><Skeleton className="h-4 w-48" /></TableHead>
							<TableHead><Skeleton className="h-4 w-16" /></TableHead>
							<TableHead><Skeleton className="h-4 w-24" /></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell><Skeleton className="h-4 w-24" /></TableCell>
								<TableCell><Skeleton className="h-4 w-40" /></TableCell>
								<TableCell><Skeleton className="h-4 w-48" /></TableCell>
								<TableCell><Skeleton className="h-4 w-16" /></TableCell>
								<TableCell><Skeleton className="h-4 w-24" /></TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</CardContent>
	</Card>
);

export const AdvisedStudents: React.FC<{
	mnumber: string;
	term?: string;
	year?: number;
	title?: string;
	modalOpen?: boolean;
}> = ({
	mnumber,
	term,
	year,
	title = 'My Advised Students',
	modalOpen = false,
}) => {
		return (
			<Suspense fallback={<AdvisedStudentsSkeleton />}>
				<AdvisedStudentContent
					mnumber={mnumber}
					term={term}
					year={year}
					title={title}
					modalOpen={modalOpen}
				/>
			</Suspense>
		);
	}

export const AdvisedStudentContent: React.FC<{
	mnumber: string;
	term?: string;
	year?: number;
	title?: string;
	modalOpen?: boolean;
}> = ({
	mnumber,
	term,
	year,
	title,
	modalOpen,
}) => {
		const [isModalOpen, setIsModalOpen] = useState(false);
		const [selectedStudent, setSelectedStudent] = useState<ExtendedStudent | null>(null);

		const { getCurrentYearTerm } = useLazyLoadQuery<advisedStudentsGetCurrentTermQuery>(
			advisedStudentsGetCurrentTermQuery,
			{},
			{ fetchPolicy: "store-or-network" }
		);

		const data = useLazyLoadQuery<advisedStudentsQuery>(
			advisedStudentsQuery,
			{
				mnumber,
				term: term ? term : getCurrentYearTerm.term.code,
				year: year ? year : getCurrentYearTerm.year,
			},
			{ fetchPolicy: "store-or-network" }
		);

		const termMappings: Record<string, string> = {
			'10': 'Spring',
			'50': 'Summer',
			'80': 'Fall',
			'90': 'Winter'
		};

		console.log('Advised Students Data:', data);

		const students = data.instructor?.advisees.map((advisee) => ({
			mnumber: advisee.student.mnumber,
			first_name: advisee.student.first_name,
			middle_name: advisee.student.middle_name,
			last_name: advisee.student.last_name,
			suffix: advisee.student.suffix,
			email: advisee.student.email,
			age: advisee.student.age,
			gender: advisee.student.gender,
		}));

		return (
			<Card className='w-full'>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>
						Term: {term ? `${termMappings[term]} ${year}` : `${termMappings[getCurrentYearTerm.term.code]} ${getCurrentYearTerm.year}`}
					</CardDescription>
				</CardHeader>
				<CardContent className='px-4'>
					<div className="overflow-auto rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>M-Number</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Age</TableHead>
									<TableHead>Gender</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{students && students.length > 0 ? (
									students.map((s) => (
										<TableRow
											key={s.mnumber}
											className="cursor-pointer hover:bg-muted/50 transition"
											onClick={() => {
												setSelectedStudent(s);
												setIsModalOpen(true);
											}}
										>
											<TableCell>{s.mnumber}</TableCell>
											<TableCell className='truncate max-w-[120px]'>
												{`${s.last_name}, ${s.first_name}${s.middle_name ? ' ' + s.middle_name : ''}${s.suffix ? ' ' + s.suffix : ''}`}
											</TableCell>
											<TableCell className='truncate max-w-[120px]'>
												<a href={`mailto:${s.email.toLowerCase()}`} className="hover:underline">
													{s.email.toLowerCase()}
												</a>
											</TableCell>
											<TableCell>{s.age}</TableCell>
											<TableCell>
												{s.gender === 'M' ? 'Male' : 'Female'}
											</TableCell>
										</TableRow>
									)))
									: (
										<TableRow>
											<TableCell colSpan={5} className="text-center py-8">
												No advised students found.
											</TableCell>
										</TableRow>
									)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
				{modalOpen && <Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					title={`Student Detail: ${selectedStudent?.last_name}, ${selectedStudent?.first_name}`}
					size='5xl'
				>
					{selectedStudent?.mnumber && (
						<StudentDetail mnumber={selectedStudent?.mnumber} />
					)}
				</Modal>}
			</Card>
		);
	}

